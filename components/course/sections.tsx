import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Clock,
  Code2,
  FolderClosed,
  Gauge,
  Layers,
  PlayCircle,
  Puzzle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Users,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Breadcrumbs, Navbar } from "@/components/ui/navigation";
import { ProgressBar } from "@/components/ui/progress";
import { urlFor } from "@/sanity/lib/image";
import { formatDuration, formatLevel, formatStudentCount } from "@/lib/format";
import { BookmarkButton } from "./bookmark-button";
import { CourseContent } from "./course-content";

type Course = NonNullable<COURSE_BY_SLUG_QUERY_RESULT>;

const outcomeIcons: Record<string, LucideIcon> = {
  play: PlayCircle,
  certificate: Award,
  clock: Clock,
  target: Target,
  chart: BarChart3,
  wrench: Wrench,
  sparkles: Sparkles,
  code: Code2,
  workflow: Workflow,
  gauge: Gauge,
  layers: Layers,
  puzzle: Puzzle,
  rocket: Rocket,
  shield: ShieldCheck,
};

export function CourseNavbar() {
  return (
    <header className="border-b border-neutral-100 bg-white">
      <div className="mx-auto w-full max-w-6xl">
        <Navbar
          padded={false}
          className="min-h-20 px-4 sm:px-6 lg:px-8"
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

export function CourseBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 h-[420px] w-[55%] bg-[repeating-linear-gradient(135deg,var(--color-primary-100)_0px,var(--color-primary-100)_1px,transparent_1px,transparent_12px)] opacity-60 [mask-image:linear-gradient(225deg,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 size-64 rounded-full bg-primary-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 bottom-0 size-72 rounded-full bg-primary-100/70 blur-3xl"
      />
    </>
  );
}

function CourseHero({
  course,
  lessonHref,
  progress,
}: {
  course: Course;
  lessonHref: string;
  progress: number;
}) {
  const title = course.title ?? "Untitled course";
  const coverUrl =
    course.coverImage?.asset !== undefined
      ? urlFor(course.coverImage)
          .width(800)
          .height(800)
          .fit("crop")
          .url()
      : null;
      

  return (
    <section className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
      <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-lg bg-neutral-900 shadow-sm lg:max-w-[280px]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={course.coverImage?.alt ?? title}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 280px, 280px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-6xl font-bold text-white">
            {title.charAt(0)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        {course.popular ? (
          <div className="mb-4">
            <Badge preset="popular" />
          </div>
        ) : null}

        <h1 className="font-display text-display-2 font-bold text-neutral-900 lg:text-display-1">
          {title}
        </h1>

        {course.summary ? (
          <p className="text-body-lg mt-4 max-w-xl leading-7 text-neutral-500">
            {course.summary}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-body text-neutral-500">
          {course.level ? (
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="size-4" aria-hidden="true" />
              {formatLevel(course.level)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden="true" />
            {formatDuration(course.totalDuration)}
          </span>
          <span className="inline-flex items-center gap-2">
            <FolderClosed className="size-4" aria-hidden="true" />
            {course.moduleCount ?? 0} modules
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" aria-hidden="true" />
            {formatStudentCount(course.studentCount)} students
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={lessonHref}
            className={buttonClassName({
              className: "h-12 px-6 text-base",
            })}
          >
            {progress > 0 ? "Continue Learning" : "Start Learning"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <BookmarkButton />
        </div>
      </div>
    </section>
  );
}

function LearningOutcomes({ course }: { course: Course }) {
  const outcomes = course.learningOutcomes ?? [];

  if (outcomes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="learning-outcomes"
      className="mt-12 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2
        id="learning-outcomes"
        className="font-display text-3xl font-bold text-neutral-900"
      >
        What you&apos;ll learn
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {outcomes.map((outcome) => {
          const Icon = outcomeIcons[outcome.icon ?? ""] ?? Sparkles;

          return (
            <div
              key={outcome._key}
              className="flex gap-5 rounded-md border border-neutral-100 bg-white p-5 sm:p-6"
            >
              <Icon
                className="size-10 shrink-0 text-primary-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="text-heading-3 font-semibold text-neutral-900">
                  {outcome.title}
                </h3>
                {outcome.description ? (
                  <p className="text-body mt-2 text-neutral-500">
                    {outcome.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CourseProgressCard({
  progress,
  lessonHref,
}: {
  progress: number;
  lessonHref: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-lg border border-neutral-100 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <div className="shrink-0">
          <p className="text-small text-neutral-500">Your Progress</p>
          <p className="text-body font-semibold text-neutral-900">
            {progress}% complete
          </p>
        </div>
        <ProgressBar value={progress} className="w-full flex-1" />
        <Link
          href={lessonHref}
          className={buttonClassName({
            className: "h-11 shrink-0 px-5",
          })}
        >
          {progress > 0 ? "Continue Learning" : "Start Learning"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function CoursePage({ course }: { course: Course }) {
  const title = course.title ?? "Course";
  const firstLesson = (course.modules ?? [])
    .flatMap((module) => module.lessons ?? [])
    .find((lesson) => lesson.slug);
  const lessonHref = firstLesson?.slug
    ? `/lessons/${firstLesson.slug}`
    : "/courses";
  const progress = 0;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="pt-6 pb-7"
          items={[
            { label: "All Courses", href: "/courses" },
            { label: title },
          ]}
        />
        <CourseHero
          course={course}
          lessonHref={lessonHref}
          progress={progress}
        />
        <LearningOutcomes course={course} />
        <CourseContent
          modules={course.modules ?? []}
          moduleCount={course.moduleCount ?? course.modules?.length ?? 0}
          totalDuration={course.totalDuration}
        />
      </div>
      <CourseProgressCard progress={progress} lessonHref={lessonHref} />
    </>
  );
}
