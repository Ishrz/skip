"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchResponse } from "@/lib/search/types";
import { Select } from "@/components/ui/input";
import {
  LessonResultCard,
  SearchCta,
  SearchEmpty,
  SearchError,
  SearchPrompt,
  SearchSkeleton,
  VideoResultCard,
} from "@/components/search/sections";

type Status = "idle" | "loading" | "success" | "error";
type SortOption = "relevance" | "video" | "lesson";

const SEARCH_CACHE_LIMIT = 20;
const searchCache = new Map<string, Promise<SearchResponse>>();

const sortOptions = [
  { label: "Most Relevant", value: "relevance" },
  { label: "Videos first", value: "video" },
  { label: "Lessons first", value: "lesson" },
] satisfies Array<{ label: string; value: SortOption }>;

class SearchRequestError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "SearchRequestError";
    this.code = code;
  }
}

async function fetchSearch(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Search is temporarily unavailable.";
    const code =
      body &&
      typeof body === "object" &&
      "code" in body &&
      typeof body.code === "string"
        ? body.code
        : undefined;

    throw new SearchRequestError(message, code);
  }

  return body as SearchResponse;
}

function loadSearch(query: string) {
  const cached = searchCache.get(query);

  if (cached) {
    return cached;
  }

  const request = fetchSearch(query).catch((error: unknown) => {
    searchCache.delete(query);
    throw error;
  });

  searchCache.set(query, request);

  if (searchCache.size > SEARCH_CACHE_LIMIT) {
    const oldest = searchCache.keys().next().value;

    if (oldest) {
      searchCache.delete(oldest);
    }
  }

  return request;
}

export function SearchPage({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = initialQuery.trim();
  const hasQuery = query.length >= 2;
  const [value, setValue] = useState(initialQuery);
  const [status, setStatus] = useState<Status>(
    hasQuery ? "loading" : "idle",
  );
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [hint, setHint] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    let active = true;

    loadSearch(query)
      .then((response) => {
        if (!active) {
          return;
        }

        setData(response);
        setStatus("success");
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "Search is temporarily unavailable.",
        );
        setErrorCode(
          cause instanceof SearchRequestError ? cause.code : undefined,
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [query, reloadKey]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const results = useMemo(() => {
    const list = data?.results ?? [];

    if (sort === "relevance") {
      return list;
    }

    const preferred = sort === "video" ? "video" : "lesson";

    return [...list].sort((a, b) => {
      if (a.kind === b.kind) {
        return 0;
      }

      return a.kind === preferred ? -1 : 1;
    });
  }, [data, sort]);

  const total = data?.total ?? 0;
  const courseCount = data?.courseCount ?? 0;
  const totalLabel = `${total} ${total === 1 ? "result" : "results"}`;

  const subtitle = !hasQuery
    ? "Find lessons and the exact video moments across every course."
    : status === "success" && data
      ? `Found ${total} ${total === 1 ? "result" : "results"} across ${courseCount} ${
          courseCount === 1 ? "course" : "courses"
        }`
      : status === "error"
        ? errorCode === "model_quota"
          ? "Search is paused while the free model quota resets."
          : "Search is temporarily unavailable."
        : "Searching lessons and video moments...";

  function retry() {
    setStatus("loading");
    setData(null);
    setError("");
    setErrorCode(undefined);
    setReloadKey((key) => key + 1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = value.trim();

    if (next.length < 2) {
      setHint("Enter at least 2 characters.");
      return;
    }

    setHint("");

    if (next === query) {
      if (status === "error") {
        retry();
      }

      return;
    }

    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="pt-6 text-center sm:pt-8">
        <span className="inline-flex items-center rounded-2xl bg-primary-100/80 px-4 py-2 text-small font-medium tracking-[0.2em] text-primary-500 uppercase">
          {hasQuery ? "Search Results" : "Search"}
        </span>

        <h1 className="font-display mx-auto mt-4 max-w-3xl text-display-2 font-bold text-neutral-900 sm:text-[2.75rem] sm:leading-[1.15] lg:text-[3rem]">
          {hasQuery ? (
            <>
              Results for{" "}
              <span className="text-primary-500">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search your learning"
          )}
        </h1>

        <p className="text-body-lg mx-auto mt-2 max-w-xl text-neutral-500">
          {subtitle}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex h-14 w-full max-w-3xl items-center gap-3 rounded-md border border-neutral-200 bg-white px-5 shadow-sm transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100"
        >
          <Search
            className="size-5 shrink-0 text-neutral-500"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);

              if (hint) {
                setHint("");
              }
            }}
            maxLength={200}
            placeholder="Search lessons and video moments..."
            aria-label="Search lessons and video moments"
            className="text-body-lg h-full w-full min-w-0 bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
          <kbd className="text-small shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-500">
            ⌘ K
          </kbd>
        </form>

        {hint ? (
          <p className="text-small mt-2 text-primary-500">{hint}</p>
        ) : null}
      </section>

      {!hasQuery ? <SearchPrompt /> : null}

      {hasQuery && status === "loading" ? <SearchSkeleton /> : null}

      {hasQuery && status === "error" ? (
        <SearchError code={errorCode} message={error} onRetry={retry} />
      ) : null}

      {hasQuery && status === "success" && data ? (
        results.length > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-neutral-900">
                {totalLabel}
              </h2>
              <Select
                aria-label="Sort results"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                options={sortOptions}
                className="w-full sm:w-[200px]"
              />
            </div>

            <div className="mt-4 space-y-5">
              {results.map((result) =>
                result.kind === "video" ? (
                  <VideoResultCard key={result.id} result={result} />
                ) : (
                  <LessonResultCard key={result.id} result={result} />
                ),
              )}
            </div>

            <SearchCta />
          </>
        ) : (
          <SearchEmpty query={query} />
        )
      ) : null}
    </main>
  );
}
