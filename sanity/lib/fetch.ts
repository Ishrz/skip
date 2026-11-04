import 'server-only'

import {client} from './client'

type SanityFetchArgs = {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
}

/**
 * Thin server-side wrapper around `client.fetch`.
 * Caching policy stays with the caller: pages decide when to add `use cache`
 * or revalidate, the data layer only tags the request.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: SanityFetchArgs): Promise<T> {
  return client.fetch<T>(query, params, {next: {tags}})
}
