import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  APICallError,
  generateText,
  RetryError,
  stepCountIs,
} from "ai";

import { hydrateSearchResults } from "./hydrate";
import {
  createSearchMcpClient,
  fetchInitialContext,
  getSearchConfig,
  SearchConfigurationError,
} from "./mcp";
import { SEARCH_REPAIR_PROMPT, SEARCH_SYSTEM_PROMPT } from "./prompt";
import { modelSearchSchema, type ModelSearchPayload } from "./schema";
import type { SearchResponse } from "./types";

const REQUEST_TIMEOUT_MS = 55_000;

export class SearchUpstreamError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SearchUpstreamError";
  }
}

export class SearchRateLimitError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SearchRateLimitError";
  }
}

function isProviderRateLimit(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return error.statusCode === 429;
  }

  if (RetryError.isInstance(error)) {
    return isProviderRateLimit(error.lastError);
  }

  return false;
}

function buildSystemPrompt(initialContext: string | null) {
  if (!initialContext) {
    return SEARCH_SYSTEM_PROMPT;
  }

  return `${SEARCH_SYSTEM_PROMPT}

# Sanity Context

${initialContext}`;
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
}

function parsePayload(
  text: string,
):
  | { ok: true; payload: ModelSearchPayload }
  | { ok: false; error: string } {
  const json = extractJsonObject(text);

  if (!json) {
    return { ok: false, error: "No JSON object found in the response." };
  }

  let value: unknown;

  try {
    value = JSON.parse(json);
  } catch {
    return { ok: false, error: "The response was not valid JSON." };
  }

  const parsed = modelSearchSchema.safeParse(value);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; "),
    };
  }

  return { ok: true, payload: parsed.data };
}

export async function runSearch(query: string): Promise<SearchResponse> {
  const config = getSearchConfig();
  let client: Awaited<ReturnType<typeof createSearchMcpClient>> | undefined;

  try {
    client = await createSearchMcpClient(config);

    const initialContext = await fetchInitialContext(config);
    const tools = await client.tools();

    if (initialContext) {
      delete (tools as Record<string, unknown>).initial_context;
    }

    delete (tools as Record<string, unknown>).schema_explorer;
    delete (tools as Record<string, unknown>).array_field_reader;

    const google = createGoogleGenerativeAI({ apiKey: config.googleKey });
    const model = google(config.model);
    const result = await generateText({
      model,
      instructions: buildSystemPrompt(initialContext),
      prompt: query,
      tools,
      stopWhen: stepCountIs(20),
      temperature: 0,
      maxOutputTokens: 8_000,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      providerOptions: {
        google: { thinkingConfig: { thinkingBudget: 0 } },
      },
    });

    let parsed = parsePayload(result.text);

    if (!parsed.ok) {
      const repair = await generateText({
        model,
        instructions: SEARCH_REPAIR_PROMPT,
        prompt: `Learner query: ${query}

Invalid output:
${result.text.slice(0, 8_000)}

Validation error:
${parsed.error}

Return corrected JSON only.`,
        temperature: 0,
        maxOutputTokens: 8_000,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      });

      parsed = parsePayload(repair.text);
    }

    if (!parsed.ok) {
      throw new SearchUpstreamError("Search output could not be validated.");
    }

    return hydrateSearchResults(query, parsed.payload.results);
  } catch (error) {
    if (
      error instanceof SearchConfigurationError ||
      error instanceof SearchUpstreamError ||
      error instanceof SearchRateLimitError
    ) {
      throw error;
    }

    if (isProviderRateLimit(error)) {
      throw new SearchRateLimitError("Search provider is rate limited.", {
        cause: error,
      });
    }

    throw new SearchUpstreamError("Search request failed.", {
      cause: error,
    });
  } finally {
    if (client) {
      await client.close().catch(() => undefined);
    }
  }
}
