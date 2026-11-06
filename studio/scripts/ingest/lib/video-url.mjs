/**
 * Provider URL parsing for the offline video pipeline.
 *
 * Playback still lives in the web app (`lib/video.ts`). This module only needs
 * enough information to fetch a transcript and give the Sanity document a
 * stable, readable id.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

export function sanitizeId(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 96)
}

/**
 * @returns {{
 *   provider: 'youtube' | 'vimeo' | 'bunny',
 *   id: string,
 *   libraryId?: string,
 *   key: string
 * } | null}
 */
export function parseVideoUrl(rawUrl) {
  let url

  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null
  }

  const hostname = url.hostname.replace(/^www\./, '')
  const segments = url.pathname.split('/').filter(Boolean)

  if (hostname === 'youtu.be') {
    const id = segments[0]
    return YOUTUBE_ID.test(id ?? '') ? youtube(id) : null
  }

  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtube-nocookie.com'
  ) {
    let id = url.searchParams.get('v')

    if (!id && segments[0] === 'embed') id = segments[1]
    if (!id && segments[0] === 'shorts') id = segments[1]
    if (!id && segments[0] === 'live') id = segments[1]
    if (!id && segments[0] === 'v') id = segments[1]

    return YOUTUBE_ID.test(id ?? '') ? youtube(id) : null
  }

  if (
    hostname === 'vimeo.com' ||
    hostname === 'player.vimeo.com'
  ) {
    const id = segments.find((segment) => /^\d+$/.test(segment))
    const hash = url.searchParams.get('h') ?? undefined
    return id ? vimeo(id, hash) : null
  }

  if (hostname === 'iframe.mediadelivery.net') {
    const action = segments[0]
    const libraryId = segments[1]
    const id = segments[2]

    if (
      (action === 'embed' || action === 'play') &&
      /^\d+$/.test(libraryId ?? '') &&
      UUID.test(id ?? '')
    ) {
      return bunny(id, libraryId)
    }

    return null
  }

  if (hostname === 'video.bunnycdn.com') {
    const libraryIndex = segments.indexOf('library')
    const videoIndex = segments.indexOf('videos')
    const libraryId = segments[libraryIndex + 1]
    const id = segments[videoIndex + 1]

    if (
      libraryIndex >= 0 &&
      videoIndex > libraryIndex &&
      /^\d+$/.test(libraryId ?? '') &&
      UUID.test(id ?? '')
    ) {
      return bunny(id, libraryId)
    }

    return null
  }

  if (hostname === 'bunnycdn.com' || hostname.endsWith('.bunnycdn.com')) {
    const id = segments.find((segment) => UUID.test(segment))
    return id ? bunny(id) : null
  }

  return null
}

export function documentIdFor(parsed) {
  return `video.${parsed.provider}-${sanitizeId(parsed.id)}`
}

export function sidecarIdFor(parsed) {
  return `${parsed.provider}-${sanitizeId(parsed.id)}`
}function youtube(id) {
  return {
    provider: 'youtube',
    id,
    key: `youtube-${id}`,
  }
}

function vimeo(id, hash) {
  return {
    provider: 'vimeo',
    id,
    ...(hash ? {hash} : {}),
    key: `vimeo-${id}`,
  }
}

function bunny(id, libraryId) {
  return {
    provider: 'bunny',
    id,
    ...(libraryId ? { libraryId } : {}),
    key: `bunny-${id}`,
  }
}
