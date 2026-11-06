/**
 * Transcript and chapter normalization shared by every provider adapter.
 *
 * The output is deliberately small: short timestamped chunks and clean chapter
 * labels. Nothing here keeps a whole transcript as one string.
 */

const DEFAULT_TARGET_SECONDS = 30
const DEFAULT_MAX_CHARS = 320
const MAX_CHAPTER_LABEL = 160

const CHAPTER_LINE =
  /^\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,]\d{1,3})?\s*(?:[-–—:|]\s*)?(.+?)\s*$/

export function parseTimestamp(value) {
  if (typeof value !== 'string') return null

  const cleaned = value.trim().replace(',', '.')
  const match = cleaned.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?$/)

  if (!match) return null

  const first = Number(match[1])
  const second = Number(match[2])
  const third = match[3] === undefined ? null : Number(match[3])
  const fraction = match[4] ? Number(`0.${match[4]}`) : 0

  if (third === null) {
    return first * 60 + second + fraction
  }

  return first * 3600 + second * 60 + third + fraction
}

export function cleanText(value) {
  return decodeEntities(String(value ?? ''))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{\\[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function chunkCues(
  cues,
  { targetSeconds = DEFAULT_TARGET_SECONDS, maxChars = DEFAULT_MAX_CHARS } = {},
) {
  const normalized = []

  for (const cue of cues ?? []) {
    const startSeconds = Number(cue?.startSeconds)
    const text = cleanText(cue?.text)

    if (!Number.isFinite(startSeconds) || startSeconds < 0 || !text) {
      continue
    }

    if (isNoise(text)) {
      continue
    }

    normalized.push({ startSeconds, text })
  }

  normalized.sort((a, b) => a.startSeconds - b.startSeconds)

  const merged = []

  for (const cue of normalized) {
    const start = Math.floor(cue.startSeconds)
    const last = merged.at(-1)

    if (last && last.startSeconds === start) {
      if (!last.text.includes(cue.text)) {
        last.text = cleanText(`${last.text} ${cue.text}`)
      }
      continue
    }

    merged.push({ startSeconds: start, text: cue.text })
  }

  const chunks = []
  let current = null

  for (const cue of merged) {
    if (!current) {
      current = { ...cue }
      continue
    }

    const elapsed = cue.startSeconds - current.startSeconds
    const nextLength = current.text.length + 1 + cue.text.length

    if (elapsed >= targetSeconds || nextLength > maxChars) {
      chunks.push(current)
      current = { ...cue }
      continue
    }

    current.text = cleanText(`${current.text} ${cue.text}`)
  }

  if (current) {
    chunks.push(current)
  }

  const usable = []

  for (const chunk of chunks) {
    if (
      !chunk.text ||
      !Number.isInteger(chunk.startSeconds) ||
      chunk.startSeconds < 0
    ) {
      continue
    }

    if (usable.at(-1)?.text === chunk.text) {
      continue
    }

    usable.push(chunk)
  }

  return usable
}

export function parseVtt(value) {
  const text = String(value ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')

  const cues = []

  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split('\n')

    if (
      lines.length === 0 ||
      /^(WEBVTT|NOTE|STYLE|REGION)\b/i.test(lines[0].trim())
    ) {
      continue
    }

    const timeIndex = lines.findIndex((line) => line.includes('-->'))

    if (timeIndex < 0) {
      continue
    }

    const timeLine = lines[timeIndex]
    const startPart = timeLine.slice(0, timeLine.indexOf('-->')).trim()
    const startSeconds = parseTimestamp(startPart)

    if (startSeconds === null) {
      continue
    }

    const cueText = cleanText(lines.slice(timeIndex + 1).join(' '))

    if (cueText) {
      cues.push({ startSeconds, text: cueText })
    }
  }

  return cues
}

export function parseChaptersFromDescription(
  description,
  { strict = true, minChapters = strict ? 3 : 1, minGapSeconds = 10 } = {},
) {
  if (!description) return []

  const chapters = []

  for (const line of String(description).split(/\r?\n/)) {
    const match = line.match(CHAPTER_LINE)

    if (!match) continue

    const hours = match[1] === undefined ? 0 : Number(match[1])
    const minutes = Number(match[2])
    const seconds = Number(match[3])
    const label = cleanChapterLabel(match[4])

    if (!label) continue

    chapters.push({
      startSeconds: hours * 3600 + minutes * 60 + seconds,
      label,
    })
  }

  return validateChapters(chapters, {
    strict,
    minChapters,
    minGapSeconds,
  })
}

export function normalizeChapters(chapters) {
  const normalized = []

  for (const chapter of chapters ?? []) {
    const rawStart = chapter?.startSeconds ?? chapter?.start
    const rawLabel = chapter?.label ?? chapter?.title
    const startSeconds = Number(rawStart)
    const label = cleanChapterLabel(rawLabel)

    if (!Number.isFinite(startSeconds) || startSeconds < 0 || !label) {
      continue
    }

    normalized.push({ startSeconds: Math.floor(startSeconds), label })
  }

  return dedupeChapters(normalized)
}

function validateChapters(chapters, { strict, minChapters, minGapSeconds }) {
  const deduped = dedupeChapters(chapters)

  if (deduped.length < minChapters) {
    return []
  }

  if (strict) {
    if (deduped[0].startSeconds !== 0) {
      return []
    }

    for (let index = 1; index < deduped.length; index += 1) {
      if (
        deduped[index].startSeconds - deduped[index - 1].startSeconds <
        minGapSeconds
      ) {
        return []
      }
    }
  }

  return deduped
}

function dedupeChapters(chapters) {
  const sorted = [...chapters].sort(
    (a, b) => a.startSeconds - b.startSeconds,
  )
  const seen = new Set()
  const result = []

  for (const chapter of sorted) {
    if (seen.has(chapter.startSeconds)) {
      continue
    }

    seen.add(chapter.startSeconds)
    result.push(chapter)
  }

  return result
}

function cleanChapterLabel(value) {
  return cleanText(value)
    .replace(/^[-–—:|]+\s*/, '')
    .replace(/\s*[-–—:|]+$/, '')
    .slice(0, MAX_CHAPTER_LABEL)
}

function isNoise(text) {
  const stripped = text
    .replace(
      /\[[^\]]*(?:music|applause|laughter|inaudible|silence)[^\]]*\]|\([^)]*(?:music|applause|laughter|inaudible|silence)[^)]*\)/gi,
      '',
    )
    .replace(/♪|>>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')

  return stripped.length === 0
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  }

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      safeCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal) =>
      safeCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
}

function safeCodePoint(value) {
  if (!Number.isFinite(value) || value < 0 || value > 0x10ffff) {
    return ''
  }

  try {
    return String.fromCodePoint(value)
  } catch {
    return ''
  }
}
