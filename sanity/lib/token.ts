import 'server-only'

/**
 * Server-only read token for the private Sanity dataset.
 * Never import this from a client component — `server-only` turns that into a
 * build error instead of a leaked token.
 */
export const readToken = assertValue(
  process.env.SANITY_API_READ_TOKEN,
  'Missing environment variable: SANITY_API_READ_TOKEN',
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
