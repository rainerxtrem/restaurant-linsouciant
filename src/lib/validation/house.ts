import { z } from "zod";

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = z.string().trim().url().max(500).optional().or(z.literal(""));
const imageId = z.string().cuid().optional().nullable();

export const producerSchema = z.object({
  name: z.string().trim().min(1).max(150),
  craft: optional(120),
  craftEn: optional(120),
  location: optional(120),
  description: optional(1500),
  descriptionEn: optional(1500),
  imageId,
  url: optionalUrl,
});
export const producerListSchema = z.array(producerSchema).max(60);
export type ProducerInput = z.infer<typeof producerSchema>;

export const distinctionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  detail: optional(200),
  detailEn: optional(200),
  imageId,
  url: optionalUrl,
});
export const distinctionListSchema = z.array(distinctionSchema).max(30);
export type DistinctionInput = z.infer<typeof distinctionSchema>;

export const seasonLabelSchema = z.object({
  label: optional(120),
  labelEn: optional(120),
});

const SEASONS = {
  fr: ["Carte d'hiver", "Carte de printemps", "Carte d'été", "Carte d'automne"],
  en: ["Winter menu", "Spring menu", "Summer menu", "Autumn menu"],
} as const;

/** « Carte d'automne · novembre 2026 » d'après une date (saisons météorologiques). */
export function seasonLabelFor(date: Date, locale: "fr" | "en"): string {
  const month = date.getMonth(); // 0 = janvier
  const season = month === 11 || month <= 1 ? 0 : month <= 4 ? 1 : month <= 7 ? 2 : 3;
  const monthName = date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { month: "long" });
  return `${SEASONS[locale][season]} · ${monthName} ${date.getFullYear()}`;
}
