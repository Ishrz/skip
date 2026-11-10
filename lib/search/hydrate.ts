import "server-only";

import type {
  SEARCH_LESSON_DETAILS_QUERY_RESULT,
  SEARCH_VIDEO_MOMENT_QUERY_RESULT,
} from "@/sanity.types";
import { getLessonPosition } from "@/sanity/lib/course-structure";
import { urlFor } from "@/sanity/lib/image";
import {
  getSearchLessonDetails,
  getSearchVideoMoment,
} from "@/sanity/queries/search";

import type { ModelSearchResult } from "./schema";
import {
  buildMatchPatterns,
  resolveTimestamp,
  type ResolvedTimestamp,
} from "./timestamps";
import type { SearchResponse, SearchResult, VideoSearchResult } from "./types";

type LessonDetail = NonNullable<SEARCH_LESSON_DETAILS_QUERY_RESULT>[number];
type VideoMoment = NonNullable<SEARCH_VIDEO_MOMENT_QUERY_RESULT>;
type Chapter = NonNullable<VideoMoment["chapters"]>[number];

const MAX_DESCRIPTION = 220;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function truncate(value: string, max = MAX_DESCRIPTION) {
  if (value.length <= max) {
    return value;
  }

  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function imageUrl(
  source: Parameters<typeof urlFor>[0] | null | undefined,
  width: number,
  height: number,
) {
  if (!source || !(source as { asset?: unknown }).asset) {
    return null;
  }

  return urlFor(source).width(width).height(height).fit("crop").url();
}

function sortedChapters(video: VideoMoment) {
  return [...(video.chapters ?? [])]
    .filter(
      (chapter): chapter is Chapter & { startSeconds: number } =>
        typeof chapter?.startSeconds === "number",
    )
    .sort((a, b) => a.startSeconds - b.startSeconds);
}

function clipLengthSeconds(
  video: VideoMoment,
  startSeconds: number,
  lessonDuration: number,
) {
  const chapters = sortedChapters(video);
  const hardEnd =
    video.durationSeconds ?? (lessonDuration || startSeconds + 90);
  const next = chapters.find(
    (chapter) => chapter.startSeconds > startSeconds,
  );
  const end = next
    ? Math.min(next.startSeconds, hardEnd)
    : Math.min(startSeconds + 90, hardEnd);
  const length = Math.round(end - startSeconds);

  return Math.max(1, length);
}

function lessonDescription(
  lesson: LessonDetail,
  fallback: string | undefined,
) {
  const notes = truncate(normalizeText(lesson.notesText));

  if (notes) {
    return notes;
  }

  const points = truncate(
    (lesson.keyPoints ?? [])
      .filter((point): point is string => typeof point === "string")
      .join(" · "),
  );

  return points || truncate(normalizeText(fallback));
}

function videoDescription(
  resolved: ResolvedTimestamp,
  fallback: string | undefined,
) {
  const primary =
    resolved.source === "chapter" ? resolved.label : resolved.text;
  const secondary =
    resolved.source === "chapter" ? resolved.text : resolved.label;

  return (
    truncate(normalizeText(primary)) ||
    truncate(normalizeText(secondary)) ||
    truncate(normalizeText(fallback))
  );
}

function keyPointsOf(lesson: LessonDetail) {
  return (lesson.keyPoints ?? [])
    .filter((point): point is string => typeof point === "string")
    .map((point) => point.trim())
    .filter(Boolean);
}

function lessonContext(lesson: LessonDetail) {
  const course = lesson.course;
  const slug = lesson.slug;

  if (
    !lesson._id ||
    !slug ||
    !course?._id ||
    !course.title ||
    !course.slug
  ) {
    return null;
  }

  const position = getLessonPosition(course, lesson._id);

  if (!position) {
    return null;
  }

  return {
    lessonId: lesson._id,
    lessonTitle: lesson.title ?? "Untitled lesson",
    lessonSlug: slug,
    courseId: course._id,
    courseTitle: course.title,
    courseSlug: course.slug,
    courseCoverUrl: imageUrl(course.coverImage, 64, 64),
    moduleTitle: position.moduleTitle,
    moduleNumber: position.moduleNumber,
    lessonNumber: position.lessonNumber,
    lessonLabel: position.lessonLabel,
    thumbnailUrl: imageUrl(lesson.thumbnail, 480, 270),
    durationSeconds: Math.max(0, Math.round(lesson.duration ?? 0)),
    description: lessonDescription(lesson, undefined),
    keyPoints: keyPointsOf(lesson),
  };
}

function clampRelevance(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function hydrateSearchResults(
  query: string,
  candidates: ModelSearchResult[],
): Promise<SearchResponse> {
  if (candidates.length === 0) {
    return { query, total: 0, courseCount: 0, results: [] };
  }

  const lessonIds = [...new Set(candidates.map((item) => item.lessonId))];
  const lessons = await getSearchLessonDetails(lessonIds);
  const lessonsById = new Map(lessons.map((lesson) => [lesson._id, lesson]));

  const videoMoments = new Map<number, VideoMoment | null>();
  const patterns = buildMatchPatterns(query);

  await Promise.all(
    candidates.map(async (candidate, index) => {
      if (candidate.kind !== "video") {
        return;
      }

      const lesson = lessonsById.get(candidate.lessonId);

      if (!lesson?.videoUrl) {
        videoMoments.set(index, null);
        return;
      }

      try {
        videoMoments.set(
          index,
          await getSearchVideoMoment(
            lesson.videoUrl,
            candidate.startSeconds,
            patterns,
          ),
        );
      } catch (error) {
        console.error("[search] video moment lookup failed", error);
        videoMoments.set(index, null);
      }
    }),
  );

  const entries = new Map<string, SearchResult>();

  function addEntry(entry: SearchResult) {
    const existing = entries.get(entry.id);

    if (!existing || entry.relevance > existing.relevance) {
      entries.set(entry.id, entry);
    }
  }

  candidates.forEach((candidate, index) => {
    const lesson = lessonsById.get(candidate.lessonId);

    if (!lesson) {
      return;
    }

    const context = lessonContext(lesson);

    if (!context) {
      return;
    }

    if (candidate.kind === "lesson") {
      const key = `lesson:${context.lessonId}`;

      addEntry({
        ...context,
        kind: "lesson",
        id: key,
        rank: 0,
        relevance: clampRelevance(candidate.relevance),
        description:
          context.description ||
          truncate(normalizeText(candidate.description)),
        href: `/lessons/${context.lessonSlug}`,
      });
      return;
    }

    const video = videoMoments.get(index);

    if (!video) {
      return;
    }

    const resolved = resolveTimestamp({
      query,
      hintSeconds: candidate.startSeconds,
      chapters: video.chapters,
      chunks: [
        ...(video.matchedChunks ?? []),
        ...(video.nearbyChunks ?? []),
      ],
    });

    if (!resolved) {
      return;
    }

    const startSeconds = resolved.startSeconds;
    const videoDuration = video.durationSeconds ?? 0;

    if (
      (context.durationSeconds > 0 &&
        startSeconds > context.durationSeconds) ||
      (videoDuration > 0 && startSeconds > videoDuration)
    ) {
      return;
    }

    const key = `video:${context.lessonId}:${startSeconds}`;
    const relevance = clampRelevance(
      candidate.relevance + (resolved.source === "chapter" ? 4 : 0),
    );

    const entry: VideoSearchResult = {
      ...context,
      kind: "video",
      id: key,
      rank: 0,
      relevance,
      description:
        videoDescription(resolved, candidate.description) ||
        context.description,
      clipLengthSeconds: clipLengthSeconds(
        video,
        startSeconds,
        context.durationSeconds,
      ),
      startSeconds,
      matchSource: resolved.source,
      href: `/lessons/${context.lessonSlug}?t=${startSeconds}`,
    };

    addEntry(entry);
  });

  const sorted = [...entries.values()].sort(
    (a, b) =>
      b.relevance - a.relevance ||
      (a.kind === b.kind ? 0 : a.kind === "video" ? -1 : 1) ||
      a.lessonTitle.localeCompare(b.lessonTitle),
  );

  const results = sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return {
    query,
    total: results.length,
    courseCount: new Set(results.map((result) => result.courseId)).size,
    results,
  };
}
