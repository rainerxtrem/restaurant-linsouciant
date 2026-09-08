import { z } from "zod";

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const menuPriceSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["FORMULA", "WINE_PAIRING"]).default("FORMULA"),
  label: z.string().trim().min(1).max(200),
  labelEn: optional(200),
  priceCents: z.coerce.number().int().min(0).max(100000),
});

export const menuDishSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(200),
  nameEn: optional(200),
  description: optional(1000),
  descriptionEn: optional(1000),
});

export const menuSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  titleEn: optional(200),
  subtitle: optional(200),
  subtitleEn: optional(200),
  dishes: z.array(menuDishSchema).default([]),
});

export const menuSchema = z.object({
  name: z.string().trim().min(2).max(200),
  nameEn: optional(200),
  description: optional(2000),
  descriptionEn: optional(2000),
  availabilityNote: optional(300),
  availabilityNoteEn: optional(300),
  mainImageId: z.string().cuid().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  order: z.coerce.number().int().min(0).default(0),
  prices: z.array(menuPriceSchema).default([]),
  sections: z.array(menuSectionSchema).default([]),
});

export type MenuInput = z.infer<typeof menuSchema>;
