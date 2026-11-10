import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderClosed,
  LoaderCircle,
  PlayCircle,
  Search,
  SearchX,
  User,
} from "lucide-react";
import type {
  LessonSearchResult,
  VideoSearchResult,
} from "@/lib/search/types";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navigation";
import { formatTimestamp } from "@/lib/format";

const edgeHatch =
  "absolute inset-y-0 hidden w-8 bg-[repeating-linear-gradient(135deg,var(--color-primary-100)_0px,var(--color-primary-100)_1px,transparent_1px,transparent_10px)] opacity-80 sm:block";

export function SearchNavbar() {
  return (
    <header className="relative z-20 border-b border-neutral-200/70 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Navbar
          padded={false}
          className="min-h-20"
          links={[
            { label: "Courses", href: "/courses" },
            { label: "My Learning", href: "/my-learning" },
          ]}
          active="Courses"
          actions={
            <>
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <Bell className="size-5" />
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary-500 ring-2 ring-white"
                />
              </button>
              <Suspense>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      aria-label="Sign in"
                      className="flex size-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    >
                      <User className="size-4" />
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <UserButton
                    appearance={{ elements: { avatarBox: "size-10" } }}
                  />
                </Show>
              </Suspense>
            </>
          }
        />
      </div>
    </header>
  );
}

export function SearchBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`${edgeHatch} left-0 [mask-image:linear-gradient(to_right,black,transparent)]`}
      />
      <div
        className={`${edgeHatch} right-0 [mask-image:linear-gradient(to_left,black,transparent)]`}
      />
    </div>
  );
}

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

export function VideoResultCard({ result }: { result: VideoSearchResult }) {
  const startLabel = formatTimestamp(result.startSeconds);

  return (
    <Link
      href={result.href}
      className="group flex flex-col gap-4 rounded-md border border-neutral-100 bg-white p-5 shadow-sm transition-shadow duration-150 hover:border-primary-100 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none md:flex-row md:gap-7"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-sm bg-neutral-900 md:w-[280px]">
        {result.thumbnailUrl ? (
          <Image
            src={result.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 280px"
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
          <Badge preset="video" className="shrink-0" />
        </div>

        <h2 className="text-2xl leading-8 font-semibold text-neutral-900 mt-4">
          {result.lessonTitle}
        </h2>

        {result.description ? (
          <p className="text-body mt-2 line-clamp-2 text-neutral-500">
            {result.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-body text-neutral-500">
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

export function LessonResultCard({ result }: { result: LessonSearchResult }) {
  return (
    <Link
      href={result.href}
      className="group flex flex-col gap-4 rounded-md border border-neutral-100 bg-white p-5 shadow-sm transition-shadow duration-150 hover:border-primary-100 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none md:flex-row md:gap-7"
    >
      <div className="flex w-full shrink-0 flex-col justify-between rounded-sm bg-neutral-50 p-5 md:w-[280px]">
        <div className="flex items-start gap-3">
          <FileText
            className="size-5 shrink-0 text-neutral-500"
            aria-hidden="true"
          />
          {result.keyPoints.length > 0 ? (
            <ul className="min-w-0 space-y-2.5">
              {result.keyPoints.slice(0, 3).map((point) => (
                <li
                  key={point}
                  className="text-body flex gap-2 font-medium text-neutral-700"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-neutral-400"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end">
          <span className="flex size-7 items-center justify-center rounded-full bg-neutral-500 text-white">
            <Check
              className="size-4"
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
        </div>
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
          <Badge preset="lesson" className="shrink-0" />
        </div>

        <h2 className="text-2xl leading-8 font-semibold text-neutral-900 mt-4">
          {result.lessonTitle}
        </h2>

        {result.description ? (
          <p className="text-body mt-2 line-clamp-2 text-neutral-500">
            {result.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <span className="text-body text-neutral-500">
            Module {result.moduleNumber}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-primary-500">
            View lesson
            <ExternalLink className="size-4" aria-hidden="true" />
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SearchCta() {
  return (
    <section className="mt-10 flex flex-col gap-5 rounded-md bg-primary-100/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
          <Search className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-body-lg font-semibold text-neutral-900">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-body mt-1 text-neutral-500">
            Try different keywords or browse our full course catalog.
          </p>
        </div>
      </div>
      <Link
        href="/courses"
        className={buttonClassName({
          variant: "secondary",
          className: "shrink-0 text-primary-500",
        })}
      >
        Browse all courses
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function SearchPrompt() {
  return (
    <section className="mt-10 rounded-md border border-neutral-100 bg-white p-10 text-center shadow-sm">
      <Search className="mx-auto size-8 text-primary-500" aria-hidden="true" />
      <h2 className="mt-4 text-heading-1 font-semibold text-neutral-900">
        Search every course
      </h2>
      <p className="text-body mx-auto mt-2 max-w-md text-neutral-500">
        Type a topic in the search field to find lessons and the exact video
        moments that teach it.
      </p>
      <Link
        href="/courses"
        className={buttonClassName({ variant: "secondary", className: "mt-6" })}
      >
        Browse all courses
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <section className="mt-10 rounded-md border border-neutral-100 bg-white p-10 text-center shadow-sm">
      <SearchX className="mx-auto size-8 text-primary-500" aria-hidden="true" />
      <h2 className="mt-4 text-heading-1 font-semibold text-neutral-900">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-body mx-auto mt-2 max-w-md text-neutral-500">
        Nothing in the catalog matches that search yet. Try different keywords
        or browse every course.
      </p>
      <Link
        href="/courses"
        className={buttonClassName({ className: "mt-6" })}
      >
        Browse all courses
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function SearchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      role="alert"
      className="mt-10 rounded-md border border-neutral-100 bg-white p-10 text-center shadow-sm"
    >
      <AlertCircle
        className="mx-auto size-8 text-primary-500"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-heading-2 font-semibold text-neutral-900">
        Search is temporarily unavailable
      </h2>
      <p className="text-body mx-auto mt-2 max-w-md text-neutral-500">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={buttonClassName({ className: "mt-6" })}
      >
        Try again
      </button>
    </section>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mt-10" role="status" aria-live="polite">
      <p className="text-body flex items-center gap-2 text-neutral-500">
        <LoaderCircle
          className="size-4 animate-spin text-primary-500"
          aria-hidden="true"
        />
        Searching lessons and video moments...
      </p>
      <div className="mt-4 space-y-5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex flex-col gap-6 rounded-md border border-neutral-100 bg-white p-5 md:flex-row"
          >
            <div className="aspect-video w-full shrink-0 animate-pulse rounded-sm bg-neutral-100 md:w-[280px]" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
              <div className="h-6 w-2/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchPageFallback() {
  return (
    <main
      aria-hidden="true"
      className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="pt-10 text-center">
        <div className="mx-auto h-7 w-36 animate-pulse rounded-2xl bg-primary-100" />
        <div className="mx-auto mt-6 h-10 w-2/3 max-w-lg animate-pulse rounded bg-neutral-100" />
        <div className="mx-auto mt-4 h-4 w-1/2 max-w-sm animate-pulse rounded bg-neutral-100" />
        <div className="mx-auto mt-6 h-14 w-full max-w-3xl animate-pulse rounded-md bg-white shadow-sm" />
      </div>
    </main>
  );
}
