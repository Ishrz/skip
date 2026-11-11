import "server-only";

import { generateText, stepCountIs, type ToolSet } from "ai";

import { hydrateSearchResults } from "./hydrate";
import {
  createSearchMcpClient,
  fetchInitialContext,
  getSearchConfig,
  SearchConfigurationError,
} from "./mcp";
import { SEARCH_REPAIR_PROMPT, SEARCH_SYSTEM_PROMPT } from "./prompt";
import {
  isRateLimitFailure,
  searchProviderAttempts,
  type SearchProviderAttempt,
} from "./providers";
import { modelSearchSchema, type ModelSearchPayload } from "./schema";
import type { SearchResponse } from "./types";

/** The whole request, including a fallback attempt, must fit inside this. */
const REQUEST_TIMEOUT_MS = 55_000;
const MIN_ATTEMPT_MS = 5_000;

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

class InvalidSearchOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSearchOutputError";
  }
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

function remainingSignal(deadline: number) {
  return AbortSignal.timeout(Math.max(1_000, deadline - Date.now()));
}

function providerOptionsOf(attempt: SearchProviderAttempt) {
  return attempt.providerOptions
    ? { providerOptions: attempt.providerOptions }
    : {};
}

async function requestPayload({
  attempt,
  tools,
  instructions,
  query,
  deadline,
}: {
  attempt: SearchProviderAttempt;
  tools: ToolSet;
  instructions: string;
  query: string;
  deadline: number;
}): Promise<ModelSearchPayload> {
  const result = await generateText({
    model: attempt.model,
    instructions,
    prompt: query,
    tools,
    stopWhen: stepCountIs(20),
    temperature: 0,
    topP: attempt.topP,
    maxOutputTokens: attempt.maxOutputTokens,
    maxRetries: attempt.maxRetries,
    abortSignal: remainingSignal(deadline),
    ...providerOptionsOf(attempt),
  });

  let parsed = parsePayload(result.text);

  if (!parsed.ok) {
    const repair = await generateText({
      model: attempt.model,
      instructions: SEARCH_REPAIR_PROMPT,
      prompt: `Learner query: ${query}

Invalid output:
${result.text.slice(0, 8_000)}

Validation error:
${parsed.error}

Return corrected JSON only.`,
      temperature: 0,
      topP: attempt.topP,
      maxOutputTokens: attempt.maxOutputTokens,
      maxRetries: attempt.maxRetries,
      abortSignal: remainingSignal(deadline),
      ...providerOptionsOf(attempt),
    });

    parsed = parsePayload(repair.text);
  }

  if (!parsed.ok) {
    throw new InvalidSearchOutputError(parsed.error);
  }

  return parsed.payload;
}

function failureFor(error: unknown) {
  if (isRateLimitFailure(error)) {
    return new SearchRateLimitError("Search provider is rate limited.", {
      cause: error,
    });
  }

  if (error instanceof SearchUpstreamError) {
    return error;
  }

  return new SearchUpstreamError("Search request failed.", {
    cause: error,
  });
}

export async function runSearch(query: string): Promise<SearchResponse> {
  const config = getSearchConfig();
  // Starts before the MCP setup so the whole request stays inside the route budget.
  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
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

    const attempts = searchProviderAttempts(config);
    const instructions = buildSystemPrompt(initialContext);
    let payload: ModelSearchPayload | null = null;
    let lastError: unknown = null;

    for (const [index, attempt] of attempts.entries()) {
      const remaining = deadline - Date.now();

      if (remaining < MIN_ATTEMPT_MS) {
        break;
      }

      // Leave the rest of the deadline for a provider that can still answer.
      const hasFallback = index < attempts.length - 1;
      const attemptDeadline = hasFallback
        ? Math.min(deadline, Date.now() + attempt.attemptTimeoutMs)
        : deadline;

      try {
        payload = await requestPayload({
          attempt,
          tools,
          instructions,
          query,
          deadline: attemptDeadline,
        });

        console.log(`[search] provider=${attempt.name}`);
        break;
      } catch (error) {
        lastError = error;

        if (error instanceof SearchConfigurationError) {
          throw error;
        }

        console.error(`[search] provider=${attempt.name} failed`, error);
      }
    }

    if (!payload) {
      throw failureFor(lastError);
    }

    return await hydrateSearchResults(query, payload.results);
  } catch (error) {
    if (
      error instanceof SearchConfigurationError ||
      error instanceof SearchUpstreamError ||
      error instanceof SearchRateLimitError
    ) {
      throw error;
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
