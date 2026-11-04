import 'server-only'

import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'
import {readToken} from './token'

/**
 * Server-only client for the private dataset.
 * `server-only` guarantees this module never reaches the browser bundle.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  useCdn: true,
  perspective: 'published',
  stega: false,
})
