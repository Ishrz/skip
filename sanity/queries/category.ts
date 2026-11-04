import {defineQuery} from 'next-sanity'

import type {
  CATEGORY_BY_SLUG_QUERY_RESULT,
  CATEGORY_LIST_QUERY_RESULT,
  CATEGORY_SLUGS_QUERY_RESULT,
} from '@/sanity.types'

import {sanityFetch} from '../lib/fetch'

export const CATEGORY_LIST_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    description,
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`)

export const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    description,
    "courses": *[_type == "course" && references(^._id)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      level,
      studentCount
    }
  }
`)

export const CATEGORY_SLUGS_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    "slug": slug.current
  }
`)

export async function getCategoryList() {
  return sanityFetch<CATEGORY_LIST_QUERY_RESULT>({
    query: CATEGORY_LIST_QUERY,
    tags: ['category', 'course'],
  })
}

export async function getCategoryBySlug(slug: string) {
  return sanityFetch<CATEGORY_BY_SLUG_QUERY_RESULT>({
    query: CATEGORY_BY_SLUG_QUERY,
    params: {slug},
    tags: ['category', 'course'],
  })
}

export async function getCategorySlugs() {
  return sanityFetch<CATEGORY_SLUGS_QUERY_RESULT>({
    query: CATEGORY_SLUGS_QUERY,
    tags: ['category'],
  })
}
