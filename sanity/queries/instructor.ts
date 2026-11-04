import {defineQuery} from 'next-sanity'

import type {
  INSTRUCTOR_BY_SLUG_QUERY_RESULT,
  INSTRUCTOR_LIST_QUERY_RESULT,
  INSTRUCTOR_SLUGS_QUERY_RESULT,
} from '@/sanity.types'

import {sanityFetch} from '../lib/fetch'

const imageProjection = /* groq */ `
  ...,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
`

export const INSTRUCTOR_LIST_QUERY = defineQuery(`
  *[_type == "instructor"] | order(name asc) {
    _id,
    _type,
    name,
    "slug": slug.current,
    expertise,
    photo { ${imageProjection} },
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    "slug": slug.current,
    expertise,
    bio,
    photo { ${imageProjection} },
    "courses": *[_type == "course" && references(^._id)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      level,
      studentCount,
      coverImage { ${imageProjection} }
    }
  }
`)

export const INSTRUCTOR_SLUGS_QUERY = defineQuery(`
  *[_type == "instructor" && defined(slug.current)] | order(name asc) {
    "slug": slug.current
  }
`)

export async function getInstructorList() {
  return sanityFetch<INSTRUCTOR_LIST_QUERY_RESULT>({
    query: INSTRUCTOR_LIST_QUERY,
    tags: ['instructor', 'course'],
  })
}

export async function getInstructorBySlug(slug: string) {
  return sanityFetch<INSTRUCTOR_BY_SLUG_QUERY_RESULT>({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: {slug},
    tags: ['instructor', 'course'],
  })
}

export async function getInstructorSlugs() {
  return sanityFetch<INSTRUCTOR_SLUGS_QUERY_RESULT>({
    query: INSTRUCTOR_SLUGS_QUERY,
    tags: ['instructor'],
  })
}
