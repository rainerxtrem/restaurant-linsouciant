import { z } from "zod";

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const themeProductPriceSchema = z.object({
  label: z.string().trim().max(200).default(""),
  labelEn: optional(200),
  priceCents: z.coerce.number().int().min(0).max(1000000),
});

export const themeProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nameEn: optional(200),
  description: optional(2000),
  descriptionEn: optional(2000),
  imageId: z.string().cuid().optional().nullable(),
  prices: z.array(themeProductPriceSchema).max(20).default([]),
});

export const THEME_PAGE_STYLES = ["classic", "christmas"] as const;
export type ThemePageStyle = (typeof THEME_PAGE_STYLES)[number];

export const themePageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  titleEn: optional(200),
  // Adresse de la page (/noel). Vide = générée depuis le titre.
  slug: optional(80),
  navLabel: optional(60),
  navLabelEn: optional(60),
  intro: optional(3000),
  introEn: optional(3000),
  orderInfo: optional(3000),
  orderInfoEn: optional(3000),
  heroImageId: z.string().cuid().optional().nullable(),
  enabled: z.boolean().default(false),
  style: z.enum(THEME_PAGE_STYLES).default("classic"),
  order: z.coerce.number().int().min(0).default(0),
  products: z.array(themeProductSchema).max(100).default([]),
});

export type ThemePageInput = z.infer<typeof themePageSchema>;
export type ThemeProductPrice = z.infer<typeof themeProductPriceSchema>;

/** Lit le champ JSON `prices` d'un produit en tolérant les données invalides. */
export function parseProductPrices(value: unknown): ThemeProductPrice[] {
  const parsed = z.array(themeProductPriceSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}
