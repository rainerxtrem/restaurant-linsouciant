import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().max(200).optional().or(z.literal("")),
  content: z.string().max(100000),
  contentEn: z.string().max(100000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(180).optional().or(z.literal("")),
});

export type PageInput = z.infer<typeof pageSchema>;
