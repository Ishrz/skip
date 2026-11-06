/**
 * Bunny Stream metadata and caption ingestion.
 *
 * Bunny exposes chapter markers on the video object and caption files under the
 * playback `captionsPath`. The Stream API key is required; it never leaves this
 * offline process.
 */

import {
  cleanText,
  normalizeChapters,
  parseVtt,
} from './transcript.mjs'

const API_BASE = 'https://video.bunnycdn.com'

export async function fetchBunny(
  parsed,
  {
    apiKey,
    libraryId,
    playbackToken,
    playbackExpires,
    lessonTitle,
    lessonDuration,
  } = {},
) {
  const library = parsed.libraryId ?? libraryId

  if (!apiKey) {
    throw new Error('BUNNY_STREAM_API_KEY is required for Bunny videos')
  }

  if (!library) {
    throw new Error(
      'Bunny library id is missing from the URL and BUNNY_STREAM_LIBRARY_ID is not set',
    )
  }

  const headers = {
    AccessKey: apiKey,
    accept: 'application/json',
  }

  const metadataResponse = await fetch(
    `${API_BASE}/library/${library}/videos/${encodeURIComponent(parsed.id)}`,
    { headers, signal: AbortSignal.timeout(20_000) },
  )

  if (!metadataResponse.ok) {
    throw new Error(
      `Bunny video metadata returned HTTP ${metadataResponse.status}`,
    )
  }

  const video = await metadataResponse.json()
  const captions = Array.isArray(video?.captions) ? video.captions : []
  const caption = chooseCaption(captions)
  const transcript = caption
    ? await fetchCaption({
        library,
        id: parsed.id,
        srclang: caption.srclang,
        headers,
        playbackToken,
        playbackExpires,
      })
    : { cues: [], error: 'Bunny video has no captions' }

  return {
    title: cleanText(video?.title) || cleanText(lessonTitle) || parsed.id,
    durationSeconds:
      Number(video?.length) > 0
        ? Math.round(Number(video.length))
        : Number(lessonDuration) || 0,
    chapters: normalizeChapters(video?.chapters),
    cues: transcript.cues,
    transcriptError: transcript.error,
  }
}

function chooseCaption(captions) {
  return (
    captions.find(
      (caption) =>
        typeof caption.srclang === 'string' &&
        (caption.srclang === 'en' || caption.srclang.startsWith('en-')),
    ) ??
    captions[0] ??
    null
  )
}

async function fetchCaption({
  library,
  id,
  srclang,
  headers,
  playbackToken,
  playbackExpires,
}) {
  const playUrl = new URL(
    `${API_BASE}/library/${library}/videos/${encodeURIComponent(id)}/play`,
  )

  if (playbackToken) {
    playUrl.searchParams.set('token', playbackToken)
  }

  if (playbackExpires) {
    playUrl.searchParams.set('expires', String(playbackExpires))
  }

  try {
    const playResponse = await fetch(playUrl, {
      headers,
      signal: AbortSignal.timeout(20_000),
    })

    if (!playResponse.ok) {
      return {
        cues: [],
        error: `Bunny play data returned HTTP ${playResponse.status}`,
      }
    }

    const play = await playResponse.json()
    const captionsPath = play?.captionsPath

    if (!captionsPath) {
      return { cues: [], error: 'Bunny play data had no captionsPath' }
    }

    const captionUrl = buildCaptionUrl({
      captionsPath,
      srclang,
      playbackToken,
      playbackExpires,
    })
    const response = await fetch(captionUrl, {
      signal: AbortSignal.timeout(20_000),
    })

    if (!response.ok) {
      return {
        cues: [],
        error: `Bunny captions returned HTTP ${response.status}`,
      }
    }

    return { cues: parseVtt(await response.text()), error: null }
  } catch (error) {
    return {
      cues: [],
      error:
        error instanceof Error ? error.message : 'Bunny captions failed',
    }
  }
}

/**
 * `captionsPath` is the CDN directory that holds `<lang>.vtt` files. It can already carry a
 * signed query string when the library uses CDN token authentication, so append to the pathname
 * and preserve the query instead of concatenating onto the whole string.
 */
function buildCaptionUrl({
  captionsPath,
  srclang,
  playbackToken,
  playbackExpires,
}) {
  const url = new URL(String(captionsPath))

  if (!url.pathname.endsWith('.vtt')) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(srclang)}.vtt`
  }

  if (playbackToken) {
    url.searchParams.set('token', playbackToken)

    if (playbackExpires) {
      url.searchParams.set('expires', String(playbackExpires))
    }
  }

  return url
}
