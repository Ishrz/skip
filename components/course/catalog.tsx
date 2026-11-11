import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Clock, FolderClosed } from "lucide-react";
import type { COURSE_LIST_QUERY_RESULT } from "@/sanity.types";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/navigation";
import { urlFor } from "@/sanity/lib/image";
import { formatDuration, formatLevel } from "@/lib/format";
import { CourseNavbar } from "./sections";

type Course = COURSE_LIST_QUERY_RESULT[number];

function CourseTile({ course }: { course: Course }) {
  const title = course.title ?? "Untitled course";
  const coverUrl =
    course.coverImage?.asset !== undefined
      ? urlFor(course.coverImage)
          .width(640)
          .height(360)
          .fit("crop")
          .url()
      : null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm transition-shadow duration-150 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={course.coverImage?.alt ?? title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-6xl font-bold text-white">
            {title.charAt(0)}
          </span>
        )}
        {course.popular ? (
          <div className="absolute top-3 left-3">
            <Badge preset="popular" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-2xl leading-8 font-bold text-neutral-900">
          {title}
        </h2>
        {course.summary ? (
          <p className="text-body mt-2 line-clamp-2 text-neutral-500">
            {course.summary}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-small text-neutral-500">
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
            <FolderClosed className="size-4" aria-hidden="true" />
            {course.moduleCount ?? 0} modules
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CoursesCatalogPage({
  courses,
}: {
  courses: COURSE_LIST_QUERY_RESULT;
}) {
  const visibleCourses = courses.filter((course) => course.slug);

  return (
    <div className="min-h-screen bg-white pb-24">
      <CourseNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="pt-6 pb-7"
          items={[{ label: "All Courses" }]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-display-2 font-bold text-neutral-900">
              All Courses
            </h1>
            <p className="text-body-lg mt-3 text-neutral-500">
              Browse every course in the Skip library and start learning
              where you left off.
            </p>
          </div>
          <p className="text-body text-neutral-500">
            {visibleCourses.length}{" "}
            {visibleCourses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {visibleCourses.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseTile key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-lg border border-neutral-100 bg-neutral-50 p-10 text-center">
            <h2 className="text-heading-2 font-semibold text-neutral-900">
              No courses yet
            </h2>
            <p className="text-body mt-2 text-neutral-500">
              New courses are added every week. Check back soon.
            </p>
            <Link
              href="/"
              className={buttonClassName({
                variant: "secondary",
                className: "mt-6",
              })}
            >
              Back home
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
