/**
 * Vimeo metadata and caption ingestion.
 *
 * The public player config exposes duration, title, and signed VTT track URLs.
 * `VIMEO_ACCESS_TOKEN` is only needed for private videos.
 */

import { cleanText, parseChaptersFromDescription, parseVtt } from './transcript.mjs'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export async function fetchVimeo(
  parsed,
  { lessonTitle, lessonDuration, accessToken } = {},
) {
  const headers = {
    'user-agent': USER_AGENT,
    accept: 'application/json',
  }

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`
  }

  const configUrl = new URL(
    `https://player.vimeo.com/video/${encodeURIComponent(parsed.id)}/config`,
  )

  if (parsed.hash) configUrl.searchParams.set('h', parsed.hash)

  const response = await fetch(configUrl, {
    headers,
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(`Vimeo player config returned HTTP ${response.status}`)
  }

  const data = await response.json()
  const video = data?.video
  const tracks = data?.request?.text_tracks ?? []
  const track = chooseTrack(tracks)
  const transcript = track
    ? await fetchTrack(track.url)
    : { cues: [], error: 'Vimeo video has no text tracks' }

  return {
    title: cleanText(video?.title) || cleanText(lessonTitle) || parsed.id,
    durationSeconds:
      Number(video?.duration) > 0
        ? Math.round(Number(video.duration))
        : Number(lessonDuration) || 0,
    chapters: parseChaptersFromDescription(video?.description, {
      strict: false,
      minChapters: 1,
    }),
    cues: transcript.cues,
    transcriptError: transcript.error,
  }
}

function chooseTrack(tracks) {
  return (
    tracks.find(
      (track) =>
        typeof track.lang === 'string' &&
        (track.lang === 'en' || track.lang.startsWith('en-')),
    ) ?? tracks[0] ?? null
  )
}

async function fetchTrack(url) {
  if (!url) {
    return { cues: [], error: 'Vimeo text track had no URL' }
  }

  try {
    const response = await fetch(url, {
      headers: { 'user-agent': USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    })

    if (!response.ok) {
      return {
        cues: [],
        error: `Vimeo captions returned HTTP ${response.status}`,
      }
    }

    return { cues: parseVtt(await response.text()), error: null }
  } catch (error) {
    return {
      cues: [],
      error:
        error instanceof Error ? error.message : 'Vimeo captions failed',
    }
  }
}
