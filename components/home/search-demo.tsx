"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  FileText,
  FolderClosed,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/format";
import { homeDemoResults } from "@/lib/home/demo-queries";

function CourseMark({ url, title }: { url: string | null; title: string }) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={24}
        height={24}
        unoptimized
        className="size-6 shrink-0 rounded-xs object-cover"
      />
    );
  }

  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-neutral-100 text-[10px] font-semibold text-neutral-500">
      {title.charAt(0)}
    </span>
  );
}

function ExampleResultCard({
  result,
}: {
  result: (typeof homeDemoResults)[number];
}) {
  const startLabel = formatTimestamp(result.startSeconds);
  const clipLabel = formatTimestamp(result.clipLengthSeconds);

  return (
    <Link
      href={result.href}
      className="group flex flex-col gap-4 rounded-md border border-neutral-100 bg-white p-5 shadow-sm transition-shadow duration-150 hover:border-primary-100 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none md:flex-row md:gap-6"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-sm bg-neutral-900 md:w-[220px]">
        {result.thumbnailUrl ? (
          <Image
            src={result.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-white/60">
            <PlayCircle className="size-10" aria-hidden="true" />
          </span>
        )}
        <span className="text-small absolute right-3 bottom-3 rounded-xs bg-black/75 px-2 py-1 font-semibold text-white">
          {startLabel}
        </span>
        <span className="text-small absolute top-3 left-3 rounded-xs bg-black/75 px-2 py-1 font-medium text-white/90">
          {clipLabel} clip
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <CourseMark
              url={result.courseCoverUrl}
              title={result.courseTitle}
            />
            <span className="text-body truncate font-semibold text-neutral-700">
              {result.courseTitle}
            </span>
          </div>
          <Badge
            preset="video"
            label="Example result"
            className="shrink-0"
          />
        </div>

        <h2 className="text-heading-2 mt-3 font-semibold text-neutral-900">
          {result.lessonTitle}
        </h2>

        <p className="text-body mt-1.5 line-clamp-2 text-neutral-500">
          {result.caption}
        </p>

        <div className="text-body mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-neutral-500">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-4" aria-hidden="true" />
              Lesson {result.lessonLabel}
            </span>
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-neutral-300"
            />
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <FolderClosed className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{result.moduleTitle}</span>
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary-500">
            <PlayCircle className="size-5" aria-hidden="true" />
            Watch from {startLabel}
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const result =
    homeDemoResults.find((item) => item.query === activeQuery) ?? null;

  function chooseExample(exampleQuery: string) {
    setQuery(exampleQuery);
    setActiveQuery(exampleQuery);
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <form
        action="/search"
        method="get"
        className="flex h-14 items-center gap-3 rounded-lg border border-neutral-200 bg-white px-5 shadow-lg"
      >
        <Search className="size-5 shrink-0 text-neutral-500" />
        <input
          type="search"
          name="q"
          required
          minLength={2}
          maxLength={200}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (activeQuery && event.target.value !== activeQuery) {
              setActiveQuery(null);
            }
          }}
          placeholder="Ask anything about your learning..."
          aria-label="Search your learning"
          className="text-body-lg h-full w-full min-w-0 bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />
        <kbd className="text-small shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-500">
          ⌘ K
        </kbd>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-small inline-flex items-center gap-1.5 font-medium text-neutral-500">
          <Sparkles className="size-3.5 text-primary-500" aria-hidden="true" />
          Try an example:
        </span>
        {homeDemoResults.map((example) => {
          const active = example.query === activeQuery;

          return (
            <button
              key={example.id}
              type="button"
              aria-pressed={active}
              onClick={() => chooseExample(example.query)}
              className={`text-small rounded-2xl border px-3 py-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                active
                  ? "border-primary-200 bg-primary-100/70 text-primary-500"
                  : "border-neutral-200 bg-white/80 text-neutral-700 hover:border-primary-200 hover:text-primary-500"
              }`}
            >
              {example.query}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-6 text-left">
        {result ? (
          <>
            <ExampleResultCard result={result} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
              <span className="text-small inline-flex items-center gap-1.5 text-neutral-500">
                <Clock className="size-3.5" aria-hidden="true" />
                A real result from a live run — no account needed.
              </span>
              <Link
                href={`/search?q=${encodeURIComponent(result.query)}`}
                className="text-small inline-flex items-center gap-1 font-semibold text-primary-500 transition-colors hover:text-primary-400"
              >
                See all results
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
