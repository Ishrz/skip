import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Link2,
  PlayCircle,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/navigation";
import { urlFor } from "@/sanity/lib/image";
import { getLessonPosition } from "@/sanity/lib/course-structure";
import {
  formatDuration,
  formatExactCount,
  formatLevel,
} from "@/lib/format";
import { getVideoSource } from "@/lib/video";
import { BookmarkButton } from "@/components/course/bookmark-button";
import { LessonNotes } from "./notes";
import {
  LessonSidebar,
  type LessonSidebarModule,
} from "./sidebar";
import { LessonTabs } from "./tabs";
import { LessonVideoPlayer } from "./video-player";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Course = NonNullable<Lesson["course"]>;
type CourseModule = NonNullable<Course["modules"]>[number];
type LessonResource = NonNullable<Lesson["resources"]>[number];

type OrderedLesson = {
  id: string;
  title: string;
  slug: string;
  duration: number | null;
};

const resourceIcons: Record<string, LucideIcon> = {
  article: FileText,
  video: PlayCircle,
  tool: Wrench,
  download: Download,
  link: Link2,
};

function getFirstParagraph(notes: Lesson["notes"]) {
  if (!notes) {
    return null;
  }

  const block = notes.find(
    (item) => item._type === "block" && item.style === "normal",
  );

  if (!block || block._type !== "block") {
    return null;
  }

  const text = block.children
    ?.map((child) => child.text ?? "")
    .join("")
    .trim();

  return text || null;
}

function getModuleDuration(module: CourseModule) {
  return (module.lessons ?? []).reduce(
    (total, lesson) => total + (lesson.duration ?? 0),
    0,
  );
}

function getSidebarModules(modules: CourseModule[]): LessonSidebarModule[] {
  return modules.map((module, index) => ({
    key: module._key,
    number: index + 1,
    title: module.title ?? "Untitled module",
    duration: getModuleDuration(module),
    lessons: (module.lessons ?? []).flatMap((lesson) =>
      lesson.slug
        ? [
            {
              id: lesson._id,
              title: lesson.title ?? "Untitled lesson",
              slug: lesson.slug,
              duration: lesson.duration,
            },
          ]
        : [],
    ),
  }));
}

function getOrderedLessons(modules: CourseModule[]): OrderedLesson[] {
  return modules.flatMap((module) =>
    (module.lessons ?? []).flatMap((lesson) =>
      lesson.slug
        ? [
            {
              id: lesson._id,
              title: lesson.title ?? "Untitled lesson",
              slug: lesson.slug,
              duration: lesson.duration,
            },
          ]
        : [],
    ),
  );
}

function LessonHero({
  lesson,
  course,
  lessonLabel,
}: {
  lesson: Lesson;
  course: Course | null;
  lessonLabel: string;
}) {
  const title = lesson.title ?? "Untitled lesson";
  const description = getFirstParagraph(lesson.notes);

  return (
    <section>
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-small font-semibold tracking-wide text-primary-500 uppercase">
              {lessonLabel}
            </span>
            {lesson.freePreview ? (
              <Badge preset="lesson" label="Free preview" />
            ) : null}
          </div>
          <h1 className="font-display text-display-2 mt-3 font-bold text-neutral-900 lg:text-display-1">
            {title}
          </h1>
        </div>
        <BookmarkButton iconOnly />
      </div>

      {description ? (
        <p className="text-body-lg mt-4 max-w-2xl leading-7 text-neutral-500">
          {description}
        </p>
      ) : null}

      <div className="text-body mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4" aria-hidden="true" />
          {formatDuration(lesson.duration)}
        </span>
        {course?.level ? (
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="size-4" aria-hidden="true" />
            {formatLevel(course.level)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-2">
          <Users className="size-4" aria-hidden="true" />
          {formatExactCount(lesson.studentCount)} students
        </span>
      </div>
    </section>
  );
}

function LessonResources({ resources }: { resources: LessonResource[] }) {
  const visible = resources.filter((resource) => Boolean(resource.url));

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h3 className="font-display text-2xl font-bold text-neutral-900">
        Resources
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((resource) => {
          const Icon = resourceIcons[resource.type ?? "article"] ?? FileText;

          return (
            <a
              key={resource._key}
              href={resource.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-md border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-150 hover:border-primary-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-sm bg-primary-100 text-primary-500">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <ExternalLink
                  className="size-4 text-neutral-300 transition-colors group-hover:text-primary-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-body mt-3 font-semibold text-neutral-900">
                {resource.title ?? "Resource"}
              </p>
              {resource.description ? (
                <p className="text-small mt-1 text-neutral-500">
                  {resource.description}
                </p>
              ) : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}

function LessonContent({
  overview,
  keyPoints,
  proTip,
  resources,
}: {
  overview: string | null;
  keyPoints: string[];
  proTip: string | null;
  resources: LessonResource[];
}) {
  return (
    <div className="max-w-3xl">
      <section>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Overview
        </h2>
        {overview ? (
          <p className="text-body-lg mt-4 leading-7 text-neutral-700">
            {overview}
          </p>
        ) : (
          <p className="text-body-lg mt-4 text-neutral-500">
            No overview has been added to this lesson yet.
          </p>
        )}
      </section>

      {keyPoints.length > 0 ? (
        <>
          <hr className="my-8 border-neutral-100" />
          <section>
            <h3 className="text-body-lg font-semibold text-neutral-900">
              In this lesson you will:
            </h3>
            <ul className="mt-4 space-y-3">
              {keyPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary-500"
                    aria-hidden="true"
                  />
                  <span className="text-body-lg leading-7 text-neutral-700">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {proTip ? (
        <>
          <hr className="my-8 border-neutral-100" />
          <aside className="flex gap-3 rounded-md border border-primary-100 bg-primary-100/40 p-5">
            <Lightbulb
              className="mt-0.5 size-5 shrink-0 text-primary-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-body font-semibold text-neutral-900">
                Pro Tip
              </p>
              <p className="text-body mt-1 leading-6 text-neutral-700">
                {proTip}
              </p>
            </div>
          </aside>
        </>
      ) : null}

      <LessonResources resources={resources} />
    </div>
  );
}

function LessonFooterNav({
  previous,
  next,
}: {
  previous: OrderedLesson | null;
  next: OrderedLesson | null;
}) {
  return (
    <footer className="border-t border-neutral-100 px-5 py-6 sm:px-8 lg:px-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {previous ? (
            <Link
              href={`/lessons/${previous.slug}`}
              className={buttonClassName({
                variant: "secondary",
                className: "h-11 shrink-0 px-5",
              })}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Previous Lesson
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={buttonClassName({
                variant: "secondary",
                className: "h-11 shrink-0 px-5",
              })}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Previous Lesson
            </button>
          )}
          {previous ? (
            <div className="min-w-0">
              <p className="text-body truncate font-medium text-neutral-900">
                {previous.title}
              </p>
              <p className="text-small text-neutral-500">
                {formatDuration(previous.duration)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:justify-end sm:gap-5">
          {next ? (
            <div className="min-w-0 sm:text-right">
              <p className="text-body truncate font-medium text-neutral-900">
                {next.title}
              </p>
              <p className="text-small text-neutral-500">
                {formatDuration(next.duration)}
              </p>
            </div>
          ) : null}
          {next ? (
            <Link
              href={`/lessons/${next.slug}`}
              className={buttonClassName({
                className: "h-11 shrink-0 px-5",
              })}
            >
              Next Lesson
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={buttonClassName({
                className: "h-11 shrink-0 px-5",
              })}
            >
              Next Lesson
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

export function LessonPage({ lesson }: { lesson: Lesson }) {
  const course = lesson.course;
  const modules = course?.modules ?? [];
  const position = getLessonPosition(course, lesson._id);
  const orderedLessons = getOrderedLessons(modules);
  const currentIndex = orderedLessons.findIndex(
    (item) => item.id === lesson._id,
  );
  const previous =
    currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const next =
    currentIndex !== -1 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

  const title = lesson.title ?? "Untitled lesson";
  const courseTitle = course?.title ?? "Course";
  const courseSlug = course?.slug ?? null;
  const currentModuleNumber = position?.moduleNumber ?? 1;
  const lessonLabel = position ? `Lesson ${position.lessonLabel}` : "Lesson";
  const overview = getFirstParagraph(lesson.notes);
  const keyPoints = (lesson.keyPoints ?? []).filter(
    (point) => point.trim().length > 0,
  );
  const resources = lesson.resources ?? [];
  const sidebarModules = getSidebarModules(modules);

  const coverUrl =
    course?.coverImage?.asset !== undefined
      ? urlFor(course.coverImage).width(96).height(96).fit("crop").url()
      : null;
  const posterUrl =
    lesson.thumbnail?.asset !== undefined
      ? urlFor(lesson.thumbnail)
          .width(1280)
          .height(720)
          .fit("crop")
          .url()
      : null;
  const posterAlt =
    lesson.thumbnail?.alt ?? `Video thumbnail for ${title}`;
  const videoSource = getVideoSource(lesson.videoUrl);

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: "All Courses", href: "/courses" },
    ...(course
      ? [
          {
            label: courseTitle,
            href: courseSlug ? `/courses/${courseSlug}` : undefined,
          },
        ]
      : []),
    ...(position?.moduleTitle ? [{ label: position.moduleTitle }] : []),
    { label: title },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl border-x border-neutral-100">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-neutral-100 lg:border-r lg:border-b-0">
          <div className="lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
            <LessonSidebar
              courseTitle={courseTitle}
              courseSlug={courseSlug}
              coverUrl={coverUrl}
              coverAlt={course?.coverImage?.alt ?? courseTitle}
              instructorName={course?.instructor?.name ?? null}
              progress={0}
              currentModuleNumber={currentModuleNumber}
              currentLessonId={lesson._id}
              modules={sidebarModules}
            />
          </div>
        </aside>

        <main className="min-w-0 px-5 pt-6 pb-10 sm:px-8 lg:px-10 lg:pt-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-6">
            <LessonHero
              lesson={lesson}
              course={course}
              lessonLabel={lessonLabel}
            />
          </div>

          <div className="mt-8">
            <LessonVideoPlayer
              key={lesson._id}
              title={title}
              posterUrl={posterUrl}
              posterAlt={posterAlt}
              source={videoSource}
            />
          </div>

          <div className="mt-8">
            <LessonTabs
              content={
                <LessonContent
                  overview={overview}
                  keyPoints={keyPoints}
                  proTip={lesson.proTip}
                  resources={resources}
                />
              }
              notes={<LessonNotes value={lesson.notes} />}
            />
          </div>
        </main>
      </div>

      <LessonFooterNav previous={previous} next={next} />
    </div>
  );
}
