type LessonEntry = {
  _id?: string | null
  _ref?: string | null
}

type ModuleEntry = {
  title?: string | null
  lessons?: Array<LessonEntry | null> | null
}

export type CourseStructure = {
  modules?: Array<ModuleEntry | null> | null
}

export type LessonPosition = {
  /** 1-based module number, derived from array order. */
  moduleNumber: number
  moduleTitle: string
  /** 1-based position inside the module, derived from array order. */
  lessonNumber: number
  /** Display label such as `5.1`. */
  lessonLabel: string
}

/**
 * Course modules and lessons carry no stored numbers — the UI needs
 * `Module 5` / `Lesson 5.1`, which come from array order. Accepts either an
 * expanded lesson (`_id`) or a bare reference (`_ref`), so it works for both
 * the course detail and lesson detail query shapes.
 */
export function getLessonPosition(
  course: CourseStructure | null | undefined,
  lessonId: string,
): LessonPosition | null {
  const modules = course?.modules ?? []

  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
    const entry = modules[moduleIndex]
    const lessons = entry?.lessons ?? []
    const lessonIndex = lessons.findIndex(
      (lesson) => lesson?._id === lessonId || lesson?._ref === lessonId,
    )

    if (lessonIndex !== -1) {
      const moduleNumber = moduleIndex + 1
      const lessonNumber = lessonIndex + 1

      return {
        moduleNumber,
        moduleTitle: entry?.title ?? '',
        lessonNumber,
        lessonLabel: `${moduleNumber}.${lessonNumber}`,
      }
    }
  }

  return null
}
