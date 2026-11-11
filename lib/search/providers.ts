import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import {
  APICallError,
  RetryError,
  type LanguageModel,
  type generateText,
} from "ai";

import type { SearchConfig } from "./mcp";

type GenerateTextOptions = Parameters<typeof generateText>[0];

const MAX_OUTPUT_TOKENS = 8_000;
/**
 * Longest a primary attempt runs when another provider can still take over.
 * A healthy search finishes in about 21 seconds, so normal requests are
 * unaffected; the remaining deadline is left for the fallback.
 */
const PRIMARY_ATTEMPT_MS = 30_000;
/**
 * Cap for the second Google model. When the primary fails fast — the observed
 * 503 case — this model gets nearly the whole remaining deadline. It is slower
 * than the primary: a full search measured 40s, so a tight cap would cut it off.
 */
const SECOND_GOOGLE_ATTEMPT_MS = 45_000;

export type SearchProviderName = "google" | "google-fallback" | "mistral";

export type SearchProviderAttempt = {
  name: SearchProviderName;
  model: LanguageModel;
  providerOptions?: GenerateTextOptions["providerOptions"];
  maxOutputTokens: number;
  maxRetries: number;
  /** Required by Mistral when sampling greedily (temperature 0). */
  topP?: number;
  /** Cap for this attempt when a later attempt can still run. */
  attemptTimeoutMs: number;
};

/**
 * Ordered attempts: the primary Google model, a second Google model on the same
 * key, then Mistral. A model-level Google outage is absorbed without a new
 * vendor quota. Providers and models that are not configured are skipped.
 */
export function searchProviderAttempts(
  config: SearchConfig,
): SearchProviderAttempt[] {
  const attempts: SearchProviderAttempt[] = [];

  if (config.googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: config.googleKey });
    const googleOptions = {
      google: { thinkingConfig: { thinkingBudget: 0 } },
    } satisfies NonNullable<GenerateTextOptions["providerOptions"]>;

    attempts.push({
      name: "google",
      model: google(config.googleModel),
      providerOptions: googleOptions,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      maxRetries: 1,
      attemptTimeoutMs: PRIMARY_ATTEMPT_MS,
    });

    if (
      config.googleFallbackModel &&
      config.googleFallbackModel !== config.googleModel
    ) {
      attempts.push({
        name: "google-fallback",
        model: google(config.googleFallbackModel),
        providerOptions: googleOptions,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        maxRetries: 1,
        attemptTimeoutMs: SECOND_GOOGLE_ATTEMPT_MS,
      });
    }
  }

  if (config.mistralKey) {
    const mistral = createMistral({ apiKey: config.mistralKey });

    attempts.push({
      name: "mistral",
      model: mistral(config.mistralModel),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // Free-tier Mistral keys can allow as few as 2 requests per minute, and a
      // retry would spend one of them. Let the runner decide what happens next.
      maxRetries: 0,
      topP: 1,
      attemptTimeoutMs: PRIMARY_ATTEMPT_MS,
    });
  }

  return attempts;
}

export function isRateLimitFailure(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return error.statusCode === 429;
  }

  if (RetryError.isInstance(error)) {
    return isRateLimitFailure(error.lastError);
  }

  return false;
}
