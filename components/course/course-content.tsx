"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

type Course = NonNullable<COURSE_BY_SLUG_QUERY_RESULT>;
type CourseModule = NonNullable<Course["modules"]>[number];

const MODULE_PREVIEW_COUNT = 6;

export function CourseContent({
  modules,
  moduleCount,
  totalDuration,
}: {
  modules: CourseModule[];
  moduleCount: number;
  totalDuration: number | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const [openModules, setOpenModules] = useState<string[]>([]);

  const visibleModules = showAll
    ? modules
    : modules.slice(0, MODULE_PREVIEW_COUNT);
  const canToggle = modules.length > MODULE_PREVIEW_COUNT;

  const toggleModule = (key: string) => {
    setOpenModules((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  return (
    <section aria-labelledby="course-content" className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          id="course-content"
          className="font-display text-3xl font-bold text-neutral-900"
        >
          Course Content
        </h2>
        <p className="text-body text-neutral-500">
          {moduleCount} modules
          <span aria-hidden="true" className="px-2">
            ·
          </span>
          {formatDuration(totalDuration)}
        </p>
      </div>

      <ul className="mt-5 overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-sm">
        {visibleModules.map((module, moduleIndex) => {
          const isOpen = openModules.includes(module._key);
          const lessons = module.lessons ?? [];
          const panelId = `module-panel-${module._key}`;

          return (
            <li
              key={module._key}
              className="border-b border-neutral-100 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleModule(module._key)}
                className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset focus-visible:outline-none sm:grid-cols-[2.25rem_minmax(0,1fr)_auto_1.25rem] sm:px-5"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-neutral-200 text-body font-medium text-neutral-700">
                  {moduleIndex + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-body-lg font-semibold text-neutral-900">
                    {module.title}
                  </span>
                  {module.summary ? (
                    <span className="mt-0.5 block text-body text-neutral-500">
                      {module.summary}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-small text-neutral-500 sm:hidden">
                    {module.lessonCount ?? lessons.length} lessons
                    <span aria-hidden="true" className="px-1.5">
                      ·
                    </span>
                    {formatDuration(module.totalDuration)}
                  </span>
                </span>
                <span className="hidden text-body text-neutral-500 sm:block">
                  {formatDuration(module.totalDuration)}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-4 text-neutral-500 transition-transform duration-150",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div
                  id={panelId}
                  className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-3 sm:px-16"
                >
                  {lessons.length > 0 ? (
                    <ol className="divide-y divide-neutral-100">
                      {lessons.map((lesson, lessonIndex) => (
                        <li key={lesson._id}>
                          <Link
                            href={`/lessons/${lesson.slug}`}
                            className="flex items-center justify-between gap-4 py-2.5 text-body text-neutral-700 transition-colors hover:text-primary-500"
                          >
                            <span className="min-w-0">
                              <span className="mr-2 text-small text-neutral-500">
                                {moduleIndex + 1}.{lessonIndex + 1}
                              </span>
                              {lesson.title}
                            </span>
                            <span className="shrink-0 text-small text-neutral-500">
                              {formatDuration(lesson.duration)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-body text-neutral-500">
                      No lessons yet.
                    </p>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {canToggle ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
            className={buttonClassName({ variant: "secondary" })}
          >
            {showAll ? "Show fewer modules" : `Show all ${modules.length} modules`}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 transition-transform", showAll && "rotate-180")}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}
