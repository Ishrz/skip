"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Play } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

export type LessonSidebarLesson = {
  id: string;
  title: string;
  slug: string | null;
  duration: number | null;
};

export type LessonSidebarModule = {
  key: string;
  number: number;
  title: string;
  duration: number;
  lessons: LessonSidebarLesson[];
};

export function LessonSidebar({
  courseTitle,
  courseSlug,
  coverUrl,
  coverAlt,
  instructorName,
  progress,
  currentModuleNumber,
  currentLessonId,
  modules,
}: {
  courseTitle: string;
  courseSlug: string | null;
  coverUrl: string | null;
  coverAlt: string;
  instructorName: string | null;
  progress: number;
  currentModuleNumber: number;
  currentLessonId: string;
  modules: LessonSidebarModule[];
}) {
  const currentModule = modules.find(
    (module) => module.number === currentModuleNumber,
  );
  const [openModules, setOpenModules] = useState<string[]>(
    currentModule ? [currentModule.key] : [],
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleModule = (key: string) => {
    setOpenModules((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-5 sm:p-6">
        <Link
          href={courseSlug ? `/courses/${courseSlug}` : "/courses"}
          className="text-body inline-flex items-center gap-2 font-medium text-primary-500 transition-colors hover:text-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to course
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-neutral-900">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={coverAlt}
                fill
                unoptimized
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center font-display text-xl font-bold text-white">
                {courseTitle.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-body font-semibold text-neutral-900">
              {courseTitle}
            </p>
            {instructorName ? (
              <p className="text-small text-neutral-500">{instructorName}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-small font-medium text-neutral-700">
            {progress}% complete
          </p>
          <ProgressBar value={progress} className="mt-2" />
        </div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="lesson-course-content"
          onClick={() => setMobileOpen((current) => !current)}
          className="text-body mt-5 flex w-full items-center justify-between border-t border-neutral-100 pt-4 font-medium text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none lg:hidden"
        >
          Course content
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-neutral-500 transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      <div
        id="lesson-course-content"
        className={cn(
          "border-t border-neutral-100 px-3 pb-5 sm:px-4",
          mobileOpen ? "block" : "hidden lg:block",
        )}
      >
        <p className="text-small px-2 pt-4 pb-2 font-medium tracking-wide text-neutral-500 uppercase">
          Module {currentModuleNumber} of {modules.length}
        </p>

        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute top-4 bottom-4 left-[1.375rem] w-px bg-neutral-100"
          />

          {modules.map((module) => {
            const isOpen = openModules.includes(module.key);
            const isCurrent = module.number === currentModuleNumber;

            return (
              <li key={module.key} className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`lesson-module-${module.key}`}
                  onClick={() => toggleModule(module.key)}
                  className="relative flex w-full items-start gap-3 rounded-sm px-1 py-2 text-left transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-small font-medium",
                      isCurrent
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-neutral-200 bg-white text-neutral-700",
                    )}
                  >
                    {module.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-body block font-medium",
                        isCurrent ? "text-primary-500" : "text-neutral-800",
                      )}
                    >
                      {module.title}
                    </span>
                    <span className="text-small text-neutral-500">
                      {formatDuration(module.duration)}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "mt-2 size-4 shrink-0 text-neutral-500 transition-transform duration-150",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen ? (
                  <ol
                    id={`lesson-module-${module.key}`}
                    className="relative z-10 ml-10 space-y-1 pb-2"
                  >
                    {module.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLessonId;

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={lesson.slug ? `/lessons/${lesson.slug}` : "#"}
                            aria-current={isCurrentLesson ? "page" : undefined}
                            className={cn(
                              "flex items-start gap-2.5 rounded-sm px-2 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset focus-visible:outline-none",
                              isCurrentLesson
                                ? "bg-primary-100/70 text-primary-500"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-2 shrink-0 rounded-full",
                                isCurrentLesson
                                  ? "size-2 bg-primary-500"
                                  : "size-2 border border-neutral-300 bg-white",
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="text-body block font-medium">
                                {lesson.title}
                              </span>
                              {isCurrentLesson ? (
                                <span className="text-small text-primary-500">
                                  Now playing
                                </span>
                              ) : null}
                            </span>
                            {isCurrentLesson ? (
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                                <Play
                                  className="size-3 fill-current"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : (
                              <span className="text-small shrink-0 text-neutral-500">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
