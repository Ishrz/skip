import "server-only";

import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";

const INITIAL_CONTEXT_TTL_MS = 5 * 60 * 1000;

type CachedContext = {
  url: string;
  value: string;
  expiresAt: number;
};

let cachedContext: CachedContext | null = null;

export type SearchConfig = {
  mcpUrl: string;
  organizationToken: string;
  googleKey: string | null;
  googleModel: string;
  /** A second Google model on the same key; null when disabled. */
  googleFallbackModel: string | null;
  mistralKey: string | null;
  mistralModel: string;
};

export class SearchConfigurationError extends Error {
  constructor() {
    super("Search is not configured.");
    this.name = "SearchConfigurationError";
  }
}

export function getSearchConfig(): SearchConfig {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  const organizationToken = process.env.SANITY_ORGANIZATION_TOKEN;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || null;
  const mistralKey = process.env.MISTRAL_API_KEY || null;

  if (!mcpUrl || !organizationToken || (!googleKey && !mistralKey)) {
    throw new SearchConfigurationError();
  }

  return {
    mcpUrl,
    organizationToken,
    googleKey,
    googleModel: process.env.GOOGLE_MODEL ?? "gemini-3.1-flash-lite",
    // A second model on the same key absorbs the model-level 503s Gemini
    // returns under load. Set GOOGLE_FALLBACK_MODEL to an empty value to turn
    // the extra attempt off.
    googleFallbackModel:
      process.env.GOOGLE_FALLBACK_MODEL === undefined
        ? "gemini-3.5-flash"
        : process.env.GOOGLE_FALLBACK_MODEL.trim() || null,
    mistralKey,
    // Ministral 14B is the best free-tier fit: 40k TPM, but only 2 requests per
    // minute. Small and Medium reject a free key outright; Large 4 allows 50
    // requests per minute but only 20k TPM, which a multi-step search exceeds.
    mistralModel: process.env.MISTRAL_MODEL ?? "ministral-14b-latest",
  };
}

export async function createSearchMcpClient(
  config: SearchConfig,
): Promise<MCPClient> {
  return createMCPClient({
    clientName: "vertex-search",
    version: "1.0.0",
    maxRetries: 1,
    transport: {
      type: "http",
      url: config.mcpUrl,
      headers: {
        Authorization: `Bearer ${config.organizationToken}`,
      },
    },
  });
}

export async function fetchInitialContext(
  config: SearchConfig,
): Promise<string | null> {
  if (
    cachedContext &&
    cachedContext.url === config.mcpUrl &&
    cachedContext.expiresAt > Date.now()
  ) {
    return cachedContext.value;
  }

  try {
    const url = new URL(config.mcpUrl);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.organizationToken}`,
        Accept: "text/plain, application/json",
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[search] initial context failed: HTTP ${response.status}`,
      );
      return null;
    }

    const value = await response.text();

    if (!value.trim()) {
      return null;
    }

    cachedContext = {
      url: config.mcpUrl,
      value,
      expiresAt: Date.now() + INITIAL_CONTEXT_TTL_MS,
    };

    return value;
  } catch (error) {
    console.error("[search] initial context failed", error);
    return null;
  }
}
