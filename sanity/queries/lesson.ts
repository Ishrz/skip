import {defineQuery} from 'next-sanity'

import type {
  LESSON_BY_SLUG_QUERY_RESULT,
  LESSON_SLUGS_QUERY_RESULT,
} from '@/sanity.types'

import {sanityFetch} from '../lib/fetch'

const imageProjection = /* groq */ `
  ...,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
`

/**
 * A lesson stores no parent course, so the course is resolved by reverse
 * reference. Its `modules` carry bare lesson references, which is all the
 * UI needs to derive `Module 5` / `Lesson 5.1` from array order.
 */
export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    videoUrl,
    duration,
    freePreview,
    studentCount,
    poster { ${imageProjection} },
    notes,
    keyPoints,
    proTip,
    resources[] {
      _key,
      _type,
      type,
      title,
      description,
      url
    },
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      "category": category->{
        _id,
        title,
        "slug": slug.current
      },
      "instructor": instructor->{
        _id,
        name,
        "slug": slug.current,
        photo { ${imageProjection} }
      },
      modules[] {
        _key,
        title,
        "lessons": lessons[] {
          _ref
        }
      }
    }
  }
`)

export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)] | order(title asc) {
    "slug": slug.current
  }
`)

export async function getLessonBySlug(slug: string) {
  return sanityFetch<LESSON_BY_SLUG_QUERY_RESULT>({
    query: LESSON_BY_SLUG_QUERY,
    params: {slug},
    tags: ['lesson', 'course'],
  })
}

export async function getLessonSlugs() {
  return sanityFetch<LESSON_SLUGS_QUERY_RESULT>({
    query: LESSON_SLUGS_QUERY,
    tags: ['lesson'],
  })
}
