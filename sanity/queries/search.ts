import { defineQuery } from "next-sanity";

import type {
  SEARCH_LESSON_DETAILS_QUERY_RESULT,
  SEARCH_VIDEO_MOMENT_QUERY_RESULT,
} from "@/sanity.types";

import { sanityFetch } from "../lib/fetch";

const imageProjection = /* groq */ `
  ...,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
`;

export const SEARCH_LESSON_DETAILS_QUERY = defineQuery(`
  *[_type == "lesson" && _id in $ids] {
    _id,
    _type,
    title,
    "slug": slug.current,
    videoUrl,
    duration,
    freePreview,
    studentCount,
    thumbnail { ${imageProjection} },
    keyPoints,
    "notesText": pt::text(notes),
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      _type,
      title,
      "slug": slug.current,
      coverImage { ${imageProjection} },
      modules[] {
        _key,
        title,
        "lessons": lessons[]->{ _id }
      }
    }
  }
`);

export const SEARCH_VIDEO_MOMENT_QUERY = defineQuery(`
  *[_type == "video" && url == $url][0] {
    _id,
    _type,
    url,
    durationSeconds,
    chapters[] {
      startSeconds,
      label
    },
    "matchedChunks": chunks[
      text match $patterns[0] ||
      text match $patterns[1] ||
      text match $patterns[2] ||
      text match $patterns[3] ||
      text match $patterns[4] ||
      text match $patterns[5]
    ] | order(startSeconds asc) [0...24] {
      startSeconds,
      text
    },
    "nearbyChunks": chunks[startSeconds >= $from && startSeconds <= $to] | order(startSeconds asc) [0...8] {
      startSeconds,
      text
    }
  }
`);

export async function getSearchLessonDetails(ids: string[]) {
  if (ids.length === 0) {
    return [] as SEARCH_LESSON_DETAILS_QUERY_RESULT;
  }

  return sanityFetch<SEARCH_LESSON_DETAILS_QUERY_RESULT>({
    query: SEARCH_LESSON_DETAILS_QUERY,
    params: { ids },
    tags: ["lesson", "course"],
  });
}

export async function getSearchVideoMoment(
  url: string,
  startSeconds: number,
  patterns: string[],
) {
  return sanityFetch<SEARCH_VIDEO_MOMENT_QUERY_RESULT>({
    query: SEARCH_VIDEO_MOMENT_QUERY,
    params: {
      url,
      patterns,
      from: Math.max(0, Math.floor(startSeconds) - 30),
      to: Math.floor(startSeconds) + 30,
    },
    tags: ["video"],
  });
}
