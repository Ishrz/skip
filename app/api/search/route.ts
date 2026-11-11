import type { NextRequest } from "next/server";

import {
  runSearch,
  SearchRateLimitError,
  SearchUpstreamError,
} from "@/lib/search/run-search";
import {
  SearchConfigurationError,
} from "@/lib/search/mcp";
import { checkRateLimit } from "@/lib/search/rate-limit";

export const maxDuration = 60;

function clientKey(request: NextRequest) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return (
    forwarded ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function jsonError(message: string, status: number, code: string) {
  return Response.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();

  if (query.length < 2 || query.length > 200) {
    return jsonError(
      "Enter a search query between 2 and 200 characters.",
      400,
      "invalid_query",
    );
  }

  if (!checkRateLimit(clientKey(request))) {
    return jsonError(
      "Too many searches. Try again in a minute.",
      429,
      "too_many_requests",
    );
  }

  try {
    const response = await runSearch(query);

    return Response.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof SearchConfigurationError) {
      return jsonError("Search is not configured.", 503, "not_configured");
    }

    if (error instanceof SearchRateLimitError) {
      console.error("[search]", error.cause ?? error);
      return jsonError(
        "The free AI model that powers search is in high demand right now. Search is working — please try again in a few minutes.",
        429,
        "model_quota",
      );
    }

    if (error instanceof SearchUpstreamError) {
      console.error("[search]", error.cause ?? error);
      return jsonError(
        "Search is temporarily unavailable.",
        502,
        "unavailable",
      );
    }

    console.error("[search]", error);
    return jsonError("Search is temporarily unavailable.", 502, "unavailable");
  }
}
