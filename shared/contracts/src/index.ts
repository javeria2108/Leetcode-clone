import { z } from "zod";

export const ProblemSummarySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
});

export const ListProblemsResponseSchema = z.object({
  items: z.array(ProblemSummarySchema),
});

export type ProblemSummary = z.infer<typeof ProblemSummarySchema>;

export type ListProblemsResponse = z.infer<typeof ListProblemsResponseSchema>;
