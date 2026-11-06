export type SearchResultBase = {
  id: string;
  rank: number;
  relevance: number;
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseCoverUrl: string | null;
  moduleTitle: string;
  moduleNumber: number;
  lessonNumber: number;
  lessonLabel: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  description: string;
  keyPoints: string[];
};

export type VideoSearchResult = SearchResultBase & {
  kind: "video";
  clipLengthSeconds: number;
  startSeconds: number;
  href: string;
};

export type LessonSearchResult = SearchResultBase & {
  kind: "lesson";
  href: string;
};

export type SearchResult = VideoSearchResult | LessonSearchResult;

export type SearchResponse = {
  query: string;
  total: number;
  courseCount: number;
  results: SearchResult[];
};
