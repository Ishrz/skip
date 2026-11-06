#!/usr/bin/env node
/**
 * Imports the generated video NDJSON with the Sanity CLI.
 *
 * `sanity datasets import` does not read the dataset out of `sanity.cli.ts` the way the document
 * commands do, so this small wrapper loads the same env files, validates that every line is a
 * video document, and passes project/dataset explicitly.
 *
 *   npm run ingest:import
 */

import {spawnSync} from 'node:child_process'
import {existsSync, readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const STUDIO_DIR = resolve(HERE, '..', '..')
const ROOT_DIR = resolve(STUDIO_DIR, '..')
const OUT_PATH = join(HERE, 'videos.ndjson')

loadEnvironment()

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ??
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset =
  process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId || !dataset) {
  fail(
    'Missing SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET. Fill in studio/.env.',
  )
}

if (!existsSync(OUT_PATH)) {
  fail('videos.ndjson is missing. Run: npm run ingest:videos')
}

const lines = readFileSync(OUT_PATH, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

if (lines.length === 0) {
  fail('videos.ndjson has no documents. Run: npm run ingest:videos')
}

for (const [index, line] of lines.entries()) {
  let document

  try {
    document = JSON.parse(line)
  } catch {
    fail(`videos.ndjson line ${index + 1} is not valid JSON.`)
  }

  if (document?._type !== 'video' || !String(document?._id ?? '').startsWith('video.')) {
    fail(
      `videos.ndjson line ${index + 1} is not a video document. Refusing to import.`,
    )
  }
}

const bin = join(
  STUDIO_DIR,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'sanity.cmd' : 'sanity',
)

if (!existsSync(bin)) {
  fail('The Sanity CLI is not installed. Run: npm install')
}

console.log(
  `Importing ${lines.length} video document(s) into ${projectId}/${dataset}…`,
)

const result = spawnSync(
  bin,
  [
    'datasets',
    'import',
    OUT_PATH,
    '--replace',
    '--project',
    projectId,
    '--dataset',
    dataset,
  ],
  {cwd: STUDIO_DIR, stdio: ['ignore', 'inherit', 'inherit']},
)

if (result.error) fail(`Could not run the Sanity CLI: ${result.error.message}`)
if (result.status !== 0) process.exit(result.status ?? 1)

console.log('Import finished.')

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
      console.warn(`Could not load ${file}: ${error.message}`)
    }
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
