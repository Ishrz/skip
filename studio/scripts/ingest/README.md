# Offline video ingestion

Builds the Sanity `video` documents that search reads for timestamped matches.

It finds every lesson video URL in the dataset, fetches the provider's transcript and chapter
markers once, and writes one `video` document per **unique exact URL**. Transcripts are stored as
short, timestamped chunks and chapters as `{startSeconds, label}`. A whole transcript is never
stored or returned to the search model.

This is offline tooling. No Next.js route imports it, and it never runs in the request path.

## Quick start

```bash
cd studio
npm install
npm run ingest:videos -- --only caching --limit 3
# inspect scripts/ingest/videos.ndjson
npm run ingest:import
```

The import uses the Sanity CLI, so it authenticates with the local CLI session. No read or write
token is added to the repo. `ingest:import` first checks that every line is a video document, so it
cannot replace courses or lessons by accident.

For the full catalog (120 lessons):

```bash
npm run ingest:videos
npm run ingest:import
```

## Flags

| Flag | Meaning |
| --- | --- |
| `--only <text>` | Keep lessons whose `_id`, title, or course title contains the text. Repeatable. |
| `--url <url>` | Add a video URL that has no lesson match. Repeatable. Without `--only`, only these URLs run. |
| `--limit <n>` | Stop after `n` unique videos. |
| `--force` | Ignore the fetch cache and refetch. |
| `--dry-run` | Fetch and validate, but write no cache, NDJSON, or documents. |
| `--import` | Run the Sanity import after the NDJSON is written. |
| `--help` | Print usage. |

Examples:

```bash
npm run ingest:videos -- --only docker --limit 5
npm run ingest:videos -- --url https://vimeo.com/76979871 --dry-run
npm run ingest:videos -- --only caching --limit 3 --import
```

## What a run does

1. Loads `.env.local` at the repo root and `.env` in `studio/`.
2. Queries every lesson with a `videoUrl` through the Sanity CLI.
3. Filters, deduplicates by exact URL, and dispatches each URL to a provider adapter.
4. Fetches metadata, transcript cues, and chapters (cache first unless `--force`).
5. Cleans and groups cues into chunks of about 30 seconds or 320 characters.
6. Validates each document, then writes `videos.ndjson` atomically.
7. With `--import`, imports with `--replace`.

`--replace` only replaces documents with the same `_id`. It does not delete other video documents
and never touches courses, lessons, instructors, or categories.

## Providers

| Provider | Transcript | Chapters | Requirements |
| --- | --- | --- | --- |
| YouTube | English captions through `youtube-transcript` | Timestamped description lines that pass YouTube's chapter rules | None |
| Vimeo | Public player config VTT, English preferred | Timestamped description lines, if present | Unlisted `h` hash from the URL; `VIMEO_ACCESS_TOKEN` is sent when set |
| Bunny | Stream caption VTT | Stream API `chapters` array | `BUNNY_STREAM_API_KEY` and a library id |

YouTube chapters are accepted only when the first starts at `0:00`, there are at least three, and
they are at least ten seconds apart. That mirrors YouTube's own chapter rules. If a video has no
valid chapters, the document keeps transcript chunks only and search falls back to them.

Vimeo and Bunny are implemented against their documented APIs but have not been exercised against
live videos. No lesson currently uses either provider; treat each first real run as a test.

## Authored chapters

If a provider exposes no usable chapters, add a sidecar file named after the provider and id:

```text
studio/scripts/ingest/chapters/youtube-u57EnkQaUTY.json
```

```json
{
  "chapters": [
    {"startSeconds": 0, "label": "What caching is"},
    {"startSeconds": 95, "label": "Where cache lives"},
    {"startSeconds": 240, "label": "Invalidation"}
  ]
}
```

An array of `{startSeconds, label}` (or `{start, title}`) is also accepted. A sidecar wins over
provider chapters. If it is missing or unusable, the provider's chapters are used.

## Cache and output

| Path | What it is |
| --- | --- |
| `scripts/ingest/.cache/` | Raw cues and metadata per exact URL. Gitignored. |
| `scripts/ingest/videos.ndjson` | Generated import file. Gitignored. |
| `scripts/ingest/chapters/` | Optional authored chapters. Committed. |

The cache keeps the raw cues so chunking can change without refetching. Delete the cache or pass
`--force` to refetch. Cache files are keyed by provider id and a hash of the exact URL.

## Environment

All of these are server-only and belong in `.env.local` or `studio/.env`. Never prefix them with
`NEXT_PUBLIC_`.

| Variable | Required | Use |
| --- | --- | --- |
| `SANITY_STUDIO_PROJECT_ID` | Yes | Dataset discovery and import. |
| `SANITY_STUDIO_DATASET` | Yes | Dataset discovery and import. |
| `VIMEO_ACCESS_TOKEN` | No | Private Vimeo videos. |
| `BUNNY_STREAM_API_KEY` | Bunny | Stream metadata and captions. |
| `BUNNY_STREAM_LIBRARY_ID` | Bunny fallback | Used when the embed URL has no library id. |
| `BUNNY_STREAM_TOKEN` | No | Signed playback token for protected captions. |
| `BUNNY_STREAM_EXPIRES` | No | Expiry paired with the signed token. |

The script never logs keys, signed caption URLs, or full provider responses.

## Documents

Each document uses `_id: video.<provider>-<sanitized-provider-id>` and stores:

- `id` — the provider video id.
- `url` — the exact `lesson.videoUrl` string, so search's exact match works.
- `title`, `durationSeconds`.
- `chapters` — optional, sorted, unique by second.
- `chunks` — short transcript pieces, sorted, unique by second.

If two different URL strings resolve to the same provider id, the second document gets a short
URL-hash suffix on its `_id`.

## Safety checks

- A video with neither chapters nor a transcript fails for that URL and makes the run exit non-zero.
- One provider failure does not abort the rest of the run; successful documents are still written.
- `--dry-run` writes nothing at all.
- The script validates ids, URLs, durations, chapter order, chunk order, and the absence of a
  whole-transcript field before writing.
