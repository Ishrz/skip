import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Clock,
  FileText,
  Search,
  Star,
  User,
} from "lucide-react";
import type { COURSE_LIST_QUERY_RESULT } from "@/sanity.types";
import { Navbar } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanity/lib/image";
import { formatDuration, formatLevel } from "@/lib/format";
import { cn } from "@/lib/cn";

export function HomeNavbar({ className }: { className?: string }) {
  return (
    <div className={cn("px-4 pt-4 sm:px-6", className)}>
      <Navbar
        className="rounded-lg border border-neutral-100 bg-white shadow-sm"
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
                className="bg-primary-500 absolute top-0.5 right-0.5 size-2 rounded-full ring-2 ring-white"
              />
            </button>
            <Suspense>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                    aria-label="Sign in"
                  >
                    <User className="size-4" />
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="primary" size="md">Sign Up</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </Suspense>
          </>
        }
      />
    </div>
  );
}

type HomeCourse = COURSE_LIST_QUERY_RESULT[number];

export function HomeCourseCard({
  course,
  className,
}: {
  course: HomeCourse;
  className?: string;
}) {
  const title = course.title ?? "Untitled course";
  const href = course.slug ? `/courses/${course.slug}` : "/courses";
  const coverUrl =
    course.coverImage?.asset !== undefined
      ? urlFor(course.coverImage)
          .width(160)
          .height(160)
          .fit("crop")
          .url()
      : null;

  return (
    <Link
      href={href}
      className={cn(
        "flex h-full flex-col rounded-md border border-neutral-100 bg-white p-5 shadow-sm transition-shadow duration-150 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="size-16 overflow-hidden rounded-lg shadow-sm">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-neutral-900 font-display text-3xl font-bold text-white">
            {title.charAt(0)}
          </span>
        )}
      </div>
      <h3 className="font-display mt-5 text-2xl leading-8 font-bold text-neutral-900">
        {title}
      </h3>
      {course.summary ? (
        <p className="text-body mt-2 line-clamp-2 text-neutral-500">
          {course.summary}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-3 text-small text-neutral-500">
        {course.level ? (
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="size-4" aria-hidden="true" />
            {formatLevel(course.level)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {formatDuration(course.totalDuration)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-4" aria-hidden="true" />
          {course.moduleCount ?? 0} modules
        </span>
      </div>
    </Link>
  );
}

export function Hero() {
  return (
    <section className="relative px-6 pt-14 pb-20 text-center sm:pt-16">
      <span className="bg-primary-100/80 inline-flex items-center rounded-2xl px-4 py-2 text-small font-medium tracking-[0.2em] text-primary-500 uppercase">
        Intelligent Learning
      </span>
      <h1 className="text-hero mx-auto mt-6 max-w-3xl text-neutral-900 [text-shadow:0_0_28px_rgba(255,255,255,0.9)]">
        Search your learning in plain English.
      </h1>
      <p className="text-body-lg mx-auto mt-6 max-w-md text-neutral-500">
        Vertex understands what you want to learn and finds the exact lessons
        across all your courses.
      </p>
      <div className="mt-10">
        <Button className="h-12 px-6 text-base">
          Explore Courses
          <ArrowRight className="size-5" />
        </Button>
      </div>
      <form
        action="/search"
        method="get"
        className="mx-auto mt-12 flex h-14 max-w-3xl items-center gap-3 rounded-lg border border-neutral-200 bg-white px-5 shadow-lg"
      >
        <Search className="size-5 shrink-0 text-neutral-500" />
        <input
          type="search"
          name="q"
          required
          minLength={2}
          maxLength={200}
          placeholder="Ask anything about your learning..."
          aria-label="Search your learning"
          className="h-full w-full min-w-0 bg-transparent text-body-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />
        <kbd className="text-small shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-500">
          ⌘ K
        </kbd>
      </form>
    </section>
  );
}

export function CoursesSection({
  courses,
  className,
}: {
  courses: COURSE_LIST_QUERY_RESULT;
  className?: string;
}) {
  const featured = courses.filter((course) => course.slug).slice(0, 3);

  return (
    <div className={cn("mx-4 pt-14 pb-16 sm:mx-6", className)}>
      <section className="mx-auto max-w-6xl rounded-xl border border-neutral-100 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-neutral-900">
            All Courses
          </h2>
          <Link
            href="/courses"
            className="text-body inline-flex items-center gap-1.5 font-medium text-primary-500 transition-colors hover:text-primary-400"
          >
            View all courses
            <ArrowRight className="size-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((course) => (
              <HomeCourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-body mt-8 text-neutral-500">
            No courses yet. Check back soon.
          </p>
        )}
        <div className="mt-12 flex items-center gap-6">
          <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
          <span className="text-body inline-flex shrink-0 items-center gap-2.5 text-neutral-500">
            <Star className="size-5 text-primary-500" />
            New courses and lessons added every week.
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
        </div>
      </section>
    </div>
  );
}

const barClusters: number[][] = [
  [50, 110, 150, 85, 130, 158, 75, 105],
  [60, 125, 95, 150, 165, 118, 148, 95, 70, 110],
];

const barBase =
  "flex-1 rounded-t-sm bg-gradient-to-b from-primary-300/90 via-primary-200/50 to-primary-100/5";

export function BottomDecoration() {
  return (
    <div
      aria-hidden="true"
      className="flex items-end gap-8 px-4 pb-3 sm:px-6"
    >
      {barClusters.map((heights, clusterIndex) => (
        <div
          key={clusterIndex}
          className="flex flex-1 items-end gap-2"
        >
          {heights.map((height, index) => (
            <span
              key={index}
              className={barBase}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
