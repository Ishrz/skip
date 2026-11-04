import {defineQuery} from 'next-sanity'

import type {
  COURSE_BY_SLUG_QUERY_RESULT,
  COURSE_LIST_QUERY_RESULT,
  COURSE_SLUGS_QUERY_RESULT,
} from '@/sanity.types'

import {sanityFetch} from '../lib/fetch'

const imageProjection = /* groq */ `
  ...,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
`

export const COURSE_LIST_QUERY = defineQuery(`
  *[_type == "course"] | order(popular desc, title asc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    summary,
    level,
    price,
    popular,
    studentCount,
    coverImage { ${imageProjection} },
    "instructor": instructor->{
      _id,
      name,
      "slug": slug.current,
      photo { ${imageProjection} }
    },
    "category": category->{
      _id,
      title,
      "slug": slug.current
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "totalDuration": math::sum(modules[].lessons[]->duration)
  }
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    summary,
    level,
    price,
    popular,
    studentCount,
    coverImage { ${imageProjection} },
    learningOutcomes[] {
      _key,
      _type,
      icon,
      title,
      description
    },
    "instructor": instructor->{
      _id,
      name,
      "slug": slug.current,
      expertise,
      photo { ${imageProjection} }
    },
    "category": category->{
      _id,
      title,
      "slug": slug.current,
      description
    },
    modules[] {
      _key,
      _type,
      title,
      summary,
      "lessons": lessons[]->{
        _id,
        _type,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        studentCount,
        poster { ${imageProjection} }
      }
    }
  }
`)

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(title asc) {
    "slug": slug.current
  }
`)

export async function getCourseList() {
  return sanityFetch<COURSE_LIST_QUERY_RESULT>({
    query: COURSE_LIST_QUERY,
    tags: ['course'],
  })
}

export async function getCourseBySlug(slug: string) {
  return sanityFetch<COURSE_BY_SLUG_QUERY_RESULT>({
    query: COURSE_BY_SLUG_QUERY,
    params: {slug},
    tags: ['course'],
  })
}

export async function getCourseSlugs() {
  return sanityFetch<COURSE_SLUGS_QUERY_RESULT>({
    query: COURSE_SLUGS_QUERY,
    tags: ['course'],
  })
}
