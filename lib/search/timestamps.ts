const MATCH_PATTERN_COUNT = 6;
const MAX_QUERY_TOKENS = 12;
const NO_MATCH_PATTERN = "*vertex-no-match-token*";

const STOPWORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "being",
  "by",
  "can",
  "could",
  "course",
  "courses",
  "did",
  "do",
  "does",
  "explain",
  "explained",
  "explains",
  "find",
  "for",
  "from",
  "get",
  "got",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "learn",
  "learning",
  "lesson",
  "lessons",
  "made",
  "make",
  "makes",
  "may",
  "me",
  "might",
  "must",
  "my",
  "need",
  "needs",
  "of",
  "on",
  "or",
  "our",
  "search",
  "searching",
  "shall",
  "should",
  "show",
  "shown",
  "shows",
  "teach",
  "teaching",
  "than",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "this",
  "those",
  "to",
  "us",
  "use",
  "used",
  "using",
  "vertex",
  "video",
  "videos",
  "want",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
]);

export type TimestampChapter = {
  startSeconds?: number | null;
  label?: string | null;
};

export type TimestampChunk = {
  startSeconds?: number | null;
  text?: string | null;
};

export type ResolvedTimestamp = {
  startSeconds: number;
  source: "chapter" | "transcript";
  label: string | null;
  text: string | null;
  score: number;
};

type NormalizedChapter = {
  startSeconds: number;
  label: string | null;
};

type NormalizedChunk = {
  startSeconds: number;
  text: string | null;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function wordTokens(value: string | null | undefined) {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stemToken(token: string) {
  if (token.length > 4 && token.endsWith("ies")) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.length > 5 && token.endsWith("ing")) {
    return token.slice(0, -3);
  }

  if (token.length > 4 && token.endsWith("ed")) {
    return token.slice(0, -2);
  }

  if (token.length > 4 && token.endsWith("es")) {
    return token.slice(0, -2);
  }

  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

function commonPrefixLength(left: string, right: string) {
  const length = Math.min(left.length, right.length);
  let index = 0;

  while (index < length && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function stemsMatch(left: string, right: string) {
  if (left === right) {
    return true;
  }

  const shortest = Math.min(left.length, right.length);

  if (shortest < 4) {
    return false;
  }

  return commonPrefixLength(left, right) >= Math.min(6, shortest);
}

export function queryTokens(value: string) {
  const tokens: string[] = [];
  const seen = new Set<string>();

  for (const raw of wordTokens(value)) {
    if (raw.length < 3 || STOPWORDS.has(raw)) {
      continue;
    }

    const token = stemToken(raw);

    if (token.length < 3 || seen.has(token)) {
      continue;
    }

    seen.add(token);
    tokens.push(token);

    if (tokens.length >= MAX_QUERY_TOKENS) {
      break;
    }
  }

  return tokens;
}

export function buildMatchPatterns(value: string) {
  const tokens = queryTokens(value).slice(0, MATCH_PATTERN_COUNT);

  return Array.from(
    { length: MATCH_PATTERN_COUNT },
    (_, index) =>
      tokens[index] ? `*${tokens[index]}*` : NO_MATCH_PATTERN,
  );
}

function scoreText(tokens: string[], value: string | null | undefined) {
  if (tokens.length === 0) {
    return 0;
  }

  const textTokens = wordTokens(value).map(stemToken);

  if (textTokens.length === 0) {
    return 0;
  }

  let exact = 0;
  let prefix = 0;

  for (const token of tokens) {
    if (textTokens.includes(token)) {
      exact += 1;
    } else if (textTokens.some((candidate) => stemsMatch(token, candidate))) {
      prefix += 1;
    }
  }

  const distinct = exact + prefix;

  if (distinct === 0) {
    return 0;
  }

  return exact * 2 + prefix + distinct / tokens.length;
}

function seconds(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : null;
}

function normalizedChapters(chapters: readonly TimestampChapter[] | null) {
  const byStart = new Map<number, NormalizedChapter>();

  for (const chapter of chapters ?? []) {
    const startSeconds = seconds(chapter.startSeconds);

    if (startSeconds === null) {
      continue;
    }

    byStart.set(startSeconds, {
      startSeconds,
      label: normalizeText(chapter.label) || null,
    });
  }

  return [...byStart.values()].sort(
    (left, right) => left.startSeconds - right.startSeconds,
  );
}

function normalizedChunks(chunks: readonly TimestampChunk[] | null) {
  const byStart = new Map<number, NormalizedChunk>();

  for (const chunk of chunks ?? []) {
    const startSeconds = seconds(chunk.startSeconds);

    if (startSeconds === null) {
      continue;
    }

    byStart.set(startSeconds, {
      startSeconds,
      text: normalizeText(chunk.text) || null,
    });
  }

  return [...byStart.values()].sort(
    (left, right) => left.startSeconds - right.startSeconds,
  );
}

function chapterAt(chapters: NormalizedChapter[], startSeconds: number) {
  let current: NormalizedChapter | null = null;

  for (const chapter of chapters) {
    if (chapter.startSeconds > startSeconds) {
      break;
    }

    current = chapter;
  }

  return current;
}

function nearestChunkAtOrAfter(
  chunks: NormalizedChunk[],
  startSeconds: number,
) {
  return (
    chunks.find((chunk) => chunk.startSeconds >= startSeconds) ?? null
  );
}

function byScoreThenHint<T extends { score: number; startSeconds: number }>(
  hintSeconds: number,
) {
  return (left: T, right: T) =>
    right.score - left.score ||
    Math.abs(left.startSeconds - hintSeconds) -
      Math.abs(right.startSeconds - hintSeconds) ||
    left.startSeconds - right.startSeconds;
}

export function resolveTimestamp({
  query,
  hintSeconds,
  chapters,
  chunks,
}: {
  query: string;
  hintSeconds: number;
  chapters?: readonly TimestampChapter[] | null;
  chunks?: readonly TimestampChunk[] | null;
}): ResolvedTimestamp | null {
  const tokens = queryTokens(query);
  const hint = seconds(hintSeconds) ?? 0;
  const normalizedChapterList = normalizedChapters(chapters ?? []);
  const normalizedChunkList = normalizedChunks(chunks ?? []);

  if (tokens.length > 0) {
    const chapterMatches = normalizedChapterList
      .map((chapter) => ({
        chapter,
        score: scoreText(tokens, chapter.label),
      }))
      .filter((match) => match.score > 0)
      .sort(
        (left, right) =>
          byScoreThenHint(hint)(
            {
              ...left.chapter,
              score: left.score,
            },
            {
              ...right.chapter,
              score: right.score,
            },
          ),
      );

    const bestChapter = chapterMatches[0];

    if (bestChapter) {
      return {
        startSeconds: bestChapter.chapter.startSeconds,
        source: "chapter",
        label: bestChapter.chapter.label,
        text:
          nearestChunkAtOrAfter(
            normalizedChunkList,
            bestChapter.chapter.startSeconds,
          )?.text ?? null,
        score: bestChapter.score,
      };
    }

    const chunkMatches = normalizedChunkList
      .map((chunk) => ({
        chunk,
        score: scoreText(tokens, chunk.text),
      }))
      .filter((match) => match.score > 0)
      .sort(
        (left, right) =>
          byScoreThenHint(hint)(
            {
              ...left.chunk,
              score: left.score,
            },
            {
              ...right.chunk,
              score: right.score,
            },
          ),
      );

    const bestChunk = chunkMatches[0];

    if (bestChunk) {
      return {
        startSeconds: bestChunk.chunk.startSeconds,
        source: "transcript",
        label:
          chapterAt(normalizedChapterList, bestChunk.chunk.startSeconds)
            ?.label ?? null,
        text: bestChunk.chunk.text,
        score: bestChunk.score,
      };
    }
  }

  // A bare `0` from the model is a placeholder unless a chapter or chunk above
  // actually matched the query. Never render a video result for it.
  if (hint === 0) {
    return null;
  }

  const hintedChapter = normalizedChapterList.find(
    (chapter) => Math.abs(chapter.startSeconds - hint) <= 2,
  );

  if (hintedChapter) {
    return {
      startSeconds: hintedChapter.startSeconds,
      source: "chapter",
      label: hintedChapter.label,
      text:
        nearestChunkAtOrAfter(normalizedChunkList, hintedChapter.startSeconds)
          ?.text ?? null,
      score: 0,
    };
  }

  const hintedChunk = normalizedChunkList.find(
    (chunk) => Math.abs(chunk.startSeconds - hint) <= 5,
  );

  if (hintedChunk) {
    return {
      startSeconds: hintedChunk.startSeconds,
      source: "transcript",
      label:
        chapterAt(normalizedChapterList, hintedChunk.startSeconds)?.label ??
        null,
      text: hintedChunk.text,
      score: 0,
    };
  }

  return null;
}
