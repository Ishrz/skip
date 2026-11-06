import { z } from "zod";

const lessonCandidate = z.object({
  kind: z.literal("lesson"),
  lessonId: z.string().min(1).max(220),
  description: z.string().max(400).optional(),
  relevance: z.number().int().min(0).max(100).default(50),
});

const videoCandidate = z.object({
  kind: z.literal("video"),
  lessonId: z.string().min(1).max(220),
  startSeconds: z.number().int().min(0).max(86400),
  description: z.string().max(400).optional(),
  relevance: z.number().int().min(0).max(100).default(50),
});

export const modelSearchSchema = z.object({
  query: z.string().max(200).optional(),
  results: z.array(z.discriminatedUnion("kind", [lessonCandidate, videoCandidate])).max(60),
});

export type ModelSearchPayload = z.infer<typeof modelSearchSchema>;
export type ModelSearchResult = ModelSearchPayload["results"][number];
