/**
 * YouTube metadata and caption ingestion.
 *
 * No YouTube Data API key exists in this project, so the watch page is read
 * directly for title, duration, description chapters, while captions come from
 * `youtube-transcript` through the Android InnerTube player endpoint.
 */

import { cleanText, parseChaptersFromDescription } from './transcript.mjs'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export async function fetchYouTube(
  parsed,
  { lessonTitle, lessonDuration } = {},
) {
  const response = await fetch(
    `https://www.youtube.com/watch?v=${encodeURIComponent(parsed.id)}&hl=en`,
    {
      headers: {
        'user-agent': USER_AGENT,
        'accept-language': 'en-US,en',
      },
      signal: AbortSignal.timeout(20_000),
    },
  )

  if (!response.ok) {
    throw new Error(`YouTube watch page returned HTTP ${response.status}`)
  }

  const html = await response.text()
  const player = parseInlineJson(html, 'ytInitialPlayerResponse')
  const details = player?.videoDetails

  if (!details?.videoId) {
    throw new Error('YouTube player response was missing video details')
  }

  const description = String(details.shortDescription ?? '')
  const duration = Number(details.lengthSeconds)
  const transcript = await fetchTranscript(parsed.id)

  return {
    title: cleanText(details.title) || cleanText(lessonTitle) || parsed.id,
    durationSeconds:
      Number.isFinite(duration) && duration > 0
        ? Math.round(duration)
        : Number(lessonDuration) || 0,
    chapters: parseChaptersFromDescription(description, { strict: true }),
    cues: transcript.cues,
    transcriptError: transcript.error,
  }
}

async function fetchTranscript(videoId) {
  const { YoutubeTranscript } = await import('youtube-transcript')

  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
    })

    return { cues: toCues(items), error: null }
  } catch {
    try {
      const items = await YoutubeTranscript.fetchTranscript(videoId)
      return { cues: toCues(items), error: null }
    } catch (error) {
      return {
        cues: [],
        error:
          error instanceof Error
            ? error.message
            : 'YouTube captions were unavailable',
      }
    }
  }
}

function toCues(items) {
  return (items ?? [])
    .map((item) => ({
      startSeconds: Number(item.offset) / 1000,
      text: item.text,
    }))
    .filter(
      (cue) => Number.isFinite(cue.startSeconds) && cue.startSeconds >= 0,
    )
}

function parseInlineJson(html, globalName) {
  const tokens = [
    `var ${globalName} = `,
    `window["${globalName}"] = `,
    `${globalName} = `,
  ]

  for (const token of tokens) {
    const startIndex = html.indexOf(token)

    if (startIndex < 0) continue

    const jsonStart = startIndex + token.length

    if (html[jsonStart] !== '{') continue

    const endIndex = findObjectEnd(html, jsonStart)

    if (endIndex < 0) continue

    try {
      return JSON.parse(html.slice(jsonStart, endIndex + 1))
    } catch {
      return null
    }
  }

  return null
}

function findObjectEnd(value, start) {
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < value.length; index += 1) {
    const character = value[index]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === '"') {
        inString = false
      }

      continue
    }

    if (character === '"') {
      inString = true
      continue
    }

    if (character === '{') {
      depth += 1
      continue
    }

    if (character === '}') {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}
