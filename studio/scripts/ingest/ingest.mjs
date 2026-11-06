#!/usr/bin/env node
/**
 * Offline video ingestion.
 *
 * Reads the lessons that already exist in Sanity, fetches each unique lesson video's transcript
 * and chapter markers from its provider, and writes one `video` document per exact video URL to
 * NDJSON. Importing is a separate, explicit step.
 *
 * Nothing here runs in the request path. The web app reads the resulting documents with its own
 * server-side token; this script only talks to the providers and the Sanity CLI.
 *
 *   npm run ingest:videos -- --only caching --limit 3
 *   npm run ingest:import
 *
 * Flags: --only <text> (repeatable), --url <url> (repeatable), --limit <n>, --force, --dry-run,
 * --import, --help.
 */

import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import {fetchBunny} from './lib/bunny.mjs'
import {chunkCues, normalizeChapters} from './lib/transcript.mjs'
import {
  documentIdFor,
  parseVideoUrl,
  sanitizeId,
  sidecarIdFor,
} from './lib/video-url.mjs'
import {fetchVimeo} from './lib/vimeo.mjs'
import {fetchYouTube} from './lib/youtube.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const STUDIO_DIR = resolve(HERE, '..', '..')
const ROOT_DIR = resolve(STUDIO_DIR, '..')
const CACHE_DIR = join(HERE, '.cache')
const CHAPTER_DIR = join(HERE, 'chapters')
const OUT_PATH = join(HERE, 'videos.ndjson')

const API_VERSION = '2026-11-03'
const THROTTLE_MS = 1000
const RETRY_DELAY_MS = 1500
const MAX_CHUNKS = 2000

loadEnvironment()

/* --------------------------------------------------------------- command line */

const options = parseArgs(process.argv.slice(2))

if (options.help) {
  printHelp()
  process.exit(0)
}

main().catch((error) => {
  console.error(`\nIngestion failed: ${messageOf(error)}`)
  process.exit(1)
})

async function main() {
  const allLessons = queryLessons()
  const targets = selectTargets(allLessons, options)

  if (targets.length === 0) {
    console.error('No lessons matched the selection. Nothing to ingest.')
    process.exit(1)
  }

  const existing = options.dryRun ? new Map() : queryExistingVideos()

  console.log(
    `Ingesting ${targets.length} video${targets.length === 1 ? '' : 's'}${
      options.dryRun ? ' (dry run)' : ''
    }.`,
  )

  const documents = []
  const failures = []
  const warnings = []
  const usedIds = new Map(existing)
  let cachedCount = 0

  for (const [index, target] of targets.entries()) {
    const label = `[${index + 1}/${targets.length}]`
    const parsed = parseVideoUrl(target.url)

    if (!parsed) {
      const reason = 'not a supported YouTube, Vimeo or Bunny video URL'
      failures.push({url: target.url, reason})
      console.log(`${label} FAIL ${target.url} — ${reason}`)
      continue
    }

    const lesson = target.lessons[0] ?? null
    const name = lesson?.title ?? parsed.id

    try {
      console.log(
        `${label} ${parsed.provider} ${parsed.id} — ${name}${lesson?._id ? ` (${lesson._id})` : ''}`,
      )

      const {source, cached} = await loadSource(target, parsed)
      if (cached) cachedCount += 1

      const sidecar = readSidecar(parsed)
      if (sidecar.error) warnings.push(`${parsed.key}: ${sidecar.error}`)

      const docId = resolveDocumentId(parsed, target.url, usedIds)
      const {document, warnings: docWarnings} = buildDocument({
        target,
        parsed,
        source,
        lesson,
        docId,
        sidecarChapters: sidecar.chapters,
      })

      warnings.push(...docWarnings.map((warning) => `${parsed.key}: ${warning}`))
      documents.push(document)

      console.log(
        `      ${document.chapters?.length ?? 0} chapters · ${
          document.chunks?.length ?? 0
        } chunks · ${document.durationSeconds}s${cached ? ' · cache' : ''}`,
      )

      if (source.transcriptError && document.chapters?.length) {
        warnings.push(
          `${parsed.key}: no transcript (${source.transcriptError}); chapter matching only`,
        )
      }

      if (!options.dryRun) writeCache(parsed, target.url, source)
    } catch (error) {
      failures.push({url: target.url, reason: messageOf(error)})
      console.log(`${label} FAIL ${target.url} — ${messageOf(error)}`)
    }
  }

  if (warnings.length > 0) {
    console.log('\nWarnings')
    for (const warning of warnings) console.log(`  - ${warning}`)
  }

  if (documents.length === 0) {
    console.log('\nNo usable video documents were produced.')
    printSummary({documents, failures, cachedCount, imported: false})
    process.exit(1)
  }

  for (const document of documents) {
    const problems = validateDocument(document)

    if (problems.length > 0) {
      failures.push({
        url: document.url,
        reason: problems.join('; '),
      })
    }
  }

  if (failures.length > 0 && documents.every((doc) => failures.some((f) => f.url === doc.url))) {
    console.log('\nEvery selected video failed validation.')
    printSummary({documents: [], failures, cachedCount, imported: false})
    process.exit(1)
  }

  const valid = documents.filter(
    (document) => !failures.some((failure) => failure.url === document.url),
  )

  if (options.dryRun) {
    console.log(`\nDry run: ${valid.length} document(s) validated, nothing written.`)
    printSummary({documents: valid, failures, cachedCount, imported: false})
    process.exit(failures.length > 0 ? 1 : 0)
  }

  writeNdjson(valid)
  console.log(`\nWrote ${valid.length} document(s) to ${OUT_PATH}`)

  let imported = false

  if (options.import) {
    imported = importNdjson()
  }

  printSummary({documents: valid, failures, cachedCount, imported})
  process.exit(failures.length > 0 ? 1 : 0)
}

/* ------------------------------------------------------------------- options */

function parseArgs(argv) {
  const parsed = {
    only: [],
    urls: [],
    limit: null,
    force: false,
    dryRun: false,
    import: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--only':
        parsed.only.push(requireValue(argv, ++index, arg).toLowerCase())
        break
      case '--url':
        parsed.urls.push(requireValue(argv, ++index, arg))
        break
      case '--limit': {
        const raw = requireValue(argv, ++index, arg)
        const limit = Number(raw)

        if (!Number.isInteger(limit) || limit < 1) {
          fail(`--limit expects a positive integer, received "${raw}"`)
        }

        parsed.limit = limit
        break
      }
      case '--force':
        parsed.force = true
        break
      case '--dry-run':
        parsed.dryRun = true
        break
      case '--import':
        parsed.import = true
        break
      case '--help':
      case '-h':
        parsed.help = true
        break
      default:
        if (arg.startsWith('-')) fail(`Unknown option "${arg}". Use --help.`)
        fail(`Unexpected argument "${arg}". Use --help.`)
    }
  }

  if (parsed.dryRun && parsed.import) {
    fail('--dry-run and --import cannot be combined.')
  }

  return parsed
}

function requireValue(argv, index, flag) {
  const value = argv[index]

  if (!value || value.startsWith('--')) {
    fail(`${flag} needs a value.`)
  }

  return value
}

function printHelp() {
  console.log(`Offline video ingestion

Usage
  npm run ingest:videos -- [options]

Options
  --only <text>   Only lessons whose id, title, course title, or slug contains <text>.
                  Repeatable.
  --url <url>     Ingest this video URL even if no lesson matches. Repeatable. When used
                  without --only, only these URLs are ingested.
  --limit <n>     Process at most n unique videos after filtering.
  --force         Ignore the fetch cache and refetch from the provider.
  --dry-run       Fetch and validate, but write no cache, NDJSON, or dataset documents.
  --import        Import videos.ndjson with the Sanity CLI after it is written.
  --help          Show this help.

Examples
  npm run ingest:videos -- --only caching --limit 3
  npm run ingest:videos -- --url https://vimeo.com/76979871 --dry-run
  npm run ingest:videos -- --only docker --limit 5 --import

Providers
  YouTube  captions via youtube-transcript; chapters from the description.
  Vimeo    public player config; VIMEO_ACCESS_TOKEN for private videos.
  Bunny    Stream API; needs BUNNY_STREAM_API_KEY and a library id.

Every run writes only video documents. Lessons and courses are never modified.`)
}

/* -------------------------------------------------------------- environment */

function loadEnvironment() {
  for (const file of [
    join(ROOT_DIR, '.env.local'),
    join(ROOT_DIR, '.env'),
    join(STUDIO_DIR, '.env'),
    join(STUDIO_DIR, '.env.local'),
  ]) {
    if (!existsSync(file)) continue

    try {
      process.loadEnvFile(file)
    } catch (error) {
      console.warn(`Could not load ${file}: ${messageOf(error)}`)
    }
  }
}

/* ------------------------------------------------------------------ lessons */

function queryLessons() {
  const query = `*[_type == "lesson" && defined(videoUrl)] | order(_id asc) {
    _id,
    title,
    videoUrl,
    duration,
    "course": *[_type == "course" && references(^._id)][0].title
  }`

  const output = runSanity(['documents', 'query', query, '--api-version', API_VERSION])
  const lessons = JSON.parse(output)

  if (!Array.isArray(lessons)) {
    throw new Error('Sanity returned an unexpected lesson query response')
  }

  return lessons
}

function queryExistingVideos() {
  const query = '*[_type == "video"]{_id, url}'
  const output = runSanity(['documents', 'query', query, '--api-version', API_VERSION])
  const documents = JSON.parse(output)

  if (!Array.isArray(documents)) return new Map()

  return new Map(
    documents
      .filter((doc) => typeof doc?._id === 'string')
      .map((doc) => [doc._id, typeof doc.url === 'string' ? doc.url : null]),
  )
}

function selectTargets(lessons, {only, urls, limit}) {
  const matches = (lesson) => {
    if (only.length === 0) return true

    const haystack = [lesson._id, lesson.title, lesson.course]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return only.some((term) => haystack.includes(term))
  }

  const filtered = only.length > 0 ? lessons.filter(matches) : lessons
  const explicit = new Set(urls.map((url) => url.trim()).filter(Boolean))
  const targets = new Map()

  const add = (url, lesson) => {
    if (!url || typeof url !== 'string') return

    const existing = targets.get(url) ?? {url, lessons: []}

    if (lesson && !existing.lessons.some((item) => item._id === lesson._id)) {
      existing.lessons.push(lesson)
    }

    targets.set(url, existing)
  }

  // With explicit URLs and no keyword filter, the URLs are the whole selection. This keeps a
  // smoke test from also ingesting unrelated lessons.
  if (explicit.size > 0 && only.length === 0) {
    for (const lesson of lessons) {
      if (explicit.has(lesson.videoUrl)) add(lesson.videoUrl, lesson)
    }

    for (const url of explicit) add(url, findLessonByUrl(lessons, url))
  } else {
    for (const lesson of filtered) add(lesson.videoUrl, lesson)

    for (const url of explicit) add(url, findLessonByUrl(lessons, url))
  }

  const list = [...targets.values()]

  return limit ? list.slice(0, limit) : list
}

function findLessonByUrl(lessons, url) {
  return lessons.find((lesson) => lesson.videoUrl === url) ?? null
}

/* ------------------------------------------------------------------- fetch */

let lastRequestAt = 0

async function loadSource(target, parsed) {
  const cachePath = cachePathFor(parsed, target.url)

  if (!options.force) {
    const cached = readCache(cachePath, parsed, target.url)

    if (cached) return {source: cached, cached: true}
  }

  const lesson = target.lessons[0] ?? null
  const context = {
    lessonTitle: lesson?.title,
    lessonDuration: lesson?.duration,
    accessToken: process.env.VIMEO_ACCESS_TOKEN,
    apiKey: process.env.BUNNY_STREAM_API_KEY,
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    playbackToken: process.env.BUNNY_STREAM_TOKEN,
    playbackExpires: process.env.BUNNY_STREAM_EXPIRES,
  }

  const source = await withRetry(async () => {
    await throttle()

    const fetched = await fetchFor(parsed, context, target.url)

    return {
      ...fetched,
      provider: parsed.provider,
      id: parsed.id,
      url: target.url,
      fetchedAt: new Date().toISOString(),
    }
  })

  return {source, cached: false}
}

async function fetchFor(parsed, context, url) {
  if (parsed.provider === 'youtube') {
    return fetchYouTube(parsed, context)
  }

  if (parsed.provider === 'vimeo') {
    return fetchVimeo(parsed, context)
  }

  if (parsed.provider === 'bunny') {
    return fetchBunny(parsed, context)
  }

  throw new Error(`Unsupported provider for ${url}`)
}

async function withRetry(operation) {
  let lastError

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt < 2) {
        await sleep(RETRY_DELAY_MS * attempt)
      }
    }
  }

  throw lastError
}

async function throttle() {
  const wait = THROTTLE_MS - (Date.now() - lastRequestAt)

  if (wait > 0) await sleep(wait)

  lastRequestAt = Date.now()
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds))
}

/* ------------------------------------------------------------------- cache */

function cachePathFor(parsed, url) {
  const digest = createHash('sha1').update(url).digest('hex').slice(0, 8)
  return join(CACHE_DIR, `${sanitizeId(parsed.key)}-${digest}.json`)
}

function readCache(cachePath, parsed, url) {
  if (!existsSync(cachePath)) return null

  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf8'))

    if (
      cached?.provider !== parsed.provider ||
      cached?.id !== parsed.id ||
      cached?.url !== url ||
      !Array.isArray(cached?.cues)
    ) {
      return null
    }

    return cached
  } catch {
    return null
  }
}

function writeCache(parsed, url, source) {
  const cachePath = cachePathFor(parsed, url)

  mkdirSync(CACHE_DIR, {recursive: true})
  writeFileSync(cachePath, `${JSON.stringify(source, null, 2)}\n`)
}

/* ---------------------------------------------------------------- sidecars */

function readSidecar(parsed) {
  const sidecarPath = join(CHAPTER_DIR, `${sidecarIdFor(parsed)}.json`)

  if (!existsSync(sidecarPath)) {
    return {chapters: null, error: null}
  }

  try {
    const raw = JSON.parse(readFileSync(sidecarPath, 'utf8'))
    const list = Array.isArray(raw) ? raw : raw?.chapters
    const chapters = Array.isArray(list) ? normalizeChapters(list) : []

    if (chapters.length === 0) {
      return {
        chapters: null,
        error: `${sidecarPath} has no usable chapters; using provider chapters`,
      }
    }

    return {chapters, error: null}
  } catch (error) {
    return {
      chapters: null,
      error: `could not read ${sidecarPath}: ${messageOf(error)}`,
    }
  }
}

/* --------------------------------------------------------------- documents */

function resolveDocumentId(parsed, url, usedIds) {
  const base = documentIdFor(parsed)
  const known = usedIds.get(base)

  if (known === undefined) {
    usedIds.set(base, url)
    return base
  }

  if (known === url) return base

  const suffixed = `${base}-${createHash('sha1').update(url).digest('hex').slice(0, 8)}`
  usedIds.set(suffixed, url)

  return suffixed
}

function buildDocument({
  target,
  parsed,
  source,
  lesson,
  docId,
  sidecarChapters,
}) {
  const warnings = []
  const lessonDuration = Number(lesson?.duration) || 0
  const fetchedDuration = Number(source?.durationSeconds) || 0
  const durationSeconds = Math.round(fetchedDuration || lessonDuration)

  if (!Number.isFinite(durationSeconds) || durationSeconds < 1) {
    throw new Error('provider and lesson both lacked a usable duration')
  }

  const providerChapters = normalizeChapters(source?.chapters)
  const chapters = normalizeChapters(sidecarChapters ?? providerChapters)
  const usableChapters = chapters.filter(
    (chapter) => chapter.startSeconds < durationSeconds,
  )

  if (chapters.length > 0 && usableChapters.length === 0) {
    warnings.push('all chapters were at or past the video duration')
  }

  const chunks = chunkCues(source?.cues).filter(
    (chunk) => chunk.startSeconds < durationSeconds,
  )

  if (chunks.length > MAX_CHUNKS) {
    throw new Error(`produced ${chunks.length} chunks, over the ${MAX_CHUNKS} cap`)
  }

  if (chunks.length === 0 && usableChapters.length === 0) {
    throw new Error(
      source?.transcriptError
        ? `no chapters and no transcript: ${source.transcriptError}`
        : 'no chapters and no transcript',
    )
  }

  const document = {
    _id: docId,
    _type: 'video',
    id: parsed.id,
    url: target.url,
    title:
      firstText(source?.title) ||
      firstText(lesson?.title) ||
      `Video ${parsed.id}`,
    durationSeconds,
  }

  if (usableChapters.length > 0) {
    document.chapters = usableChapters.map((chapter) => ({
      _type: 'videoChapter',
      _key: `chapter-${chapter.startSeconds}`,
      startSeconds: chapter.startSeconds,
      label: chapter.label,
    }))
  }

  if (chunks.length > 0) {
    document.chunks = chunks.map((chunk) => ({
      _type: 'videoChunk',
      _key: `chunk-${chunk.startSeconds}`,
      startSeconds: chunk.startSeconds,
      text: chunk.text,
    }))
  }

  return {document, warnings}
}

function validateDocument(document) {
  const problems = []

  if (typeof document._id !== 'string' || !document._id.startsWith('video.')) {
    problems.push('document id must start with video.')
  }

  if (!/^https?:\/\//i.test(document.url ?? '')) {
    problems.push('url must be http(s)')
  }

  if (!document.id) problems.push('provider id is missing')
  if (!document.title) problems.push('title is missing')

  if (
    !Number.isInteger(document.durationSeconds) ||
    document.durationSeconds < 1
  ) {
    problems.push('durationSeconds must be a positive integer')
  }

  if ('transcript' in document) {
    problems.push('a whole transcript field must never be stored')
  }

  const chapters = document.chapters ?? []
  const chunks = document.chunks ?? []

  if (chapters.length === 0 && chunks.length === 0) {
    problems.push('needs at least one chapter or transcript chunk')
  }

  let previousChapter = -1

  for (const chapter of chapters) {
    if (
      !Number.isInteger(chapter.startSeconds) ||
      chapter.startSeconds < 0
    ) {
      problems.push('chapter startSeconds must be a non-negative integer')
    } else {
      if (chapter.startSeconds <= previousChapter) {
        problems.push('chapters must be sorted and unique by startSeconds')
      }

      previousChapter = chapter.startSeconds

      if (chapter.startSeconds >= document.durationSeconds) {
        problems.push('chapter starts past the video duration')
      }
    }

    if (!chapter.label) problems.push('chapter label is empty')
  }

  let previousChunk = -1

  for (const chunk of chunks) {
    if (!Number.isInteger(chunk.startSeconds) || chunk.startSeconds < 0) {
      problems.push('chunk startSeconds must be a non-negative integer')
    } else {
      if (chunk.startSeconds <= previousChunk) {
        problems.push('chunks must be sorted and unique by startSeconds')
      }

      previousChunk = chunk.startSeconds

      if (chunk.startSeconds >= document.durationSeconds) {
        problems.push('chunk starts past the video duration')
      }
    }

    if (typeof chunk.text !== 'string' || chunk.text.trim().length === 0) {
      problems.push('chunk text is empty')
    }
  }

  return [...new Set(problems)]
}

function writeNdjson(documents) {
  const temporaryPath = `${OUT_PATH}.tmp`
  const contents = `${documents.map((doc) => JSON.stringify(doc)).join('\n')}\n`

  writeFileSync(temporaryPath, contents)
  renameSync(temporaryPath, OUT_PATH)
}

/* ------------------------------------------------------------------ import */

function importNdjson() {
  console.log(`Importing ${OUT_PATH} with the Sanity CLI…`)

  const result = runSanity(
    ['datasets', 'import', OUT_PATH, '--replace'],
    {inherit: true},
  )

  if (result.status !== 0) {
    throw new Error(`Sanity import exited with status ${result.status}`)
  }

  return true
}

/* ------------------------------------------------------------------ sanity */

function runSanity(args, {inherit = false} = {}) {
  const bin = existsSync(sanityBin())
    ? sanityBin()
    : process.platform === 'win32'
      ? 'npx.cmd'
      : 'npx'
  const commandArgs = bin === 'npx' || bin === 'npx.cmd' ? ['sanity', ...args] : args
  const target = []

  if (process.env.SANITY_STUDIO_PROJECT_ID) {
    target.push('--project', process.env.SANITY_STUDIO_PROJECT_ID)
  }

  if (process.env.SANITY_STUDIO_DATASET) {
    target.push('--dataset', process.env.SANITY_STUDIO_DATASET)
  }

  const result = spawnSync(bin, [...commandArgs, ...target], {
    cwd: STUDIO_DIR,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: inherit ? ['ignore', 'inherit', 'inherit'] : ['ignore', 'pipe', 'pipe'],
  })

  if (result.error) {
    throw new Error(`Could not run the Sanity CLI: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const detail = inherit
      ? ''
      : `: ${(result.stderr || result.stdout || '').trim().split('\n').slice(-2).join(' ')}`

    throw new Error(`Sanity CLI exited with status ${result.status}${detail}`)
  }

  return (result.stdout ?? '').trim() || result
}

function sanityBin() {
  return join(
    STUDIO_DIR,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'sanity.cmd' : 'sanity',
  )
}

/* ------------------------------------------------------------------ output */

function printSummary({documents, failures, cachedCount, imported}) {
  console.log('\nSummary')
  console.log(`  documents: ${documents.length}`)
  console.log(`  cache hits: ${cachedCount}`)
  console.log(`  failures: ${failures.length}`)
  console.log(`  imported: ${imported ? 'yes' : 'no'}`)

  for (const failure of failures) {
    console.log(`  - ${failure.url}: ${failure.reason}`)
  }
}

function firstText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
