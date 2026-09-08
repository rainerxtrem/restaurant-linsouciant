import { z } from "zod";

export const galleryAlbumSchema = z.object({
  title: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().max(200).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;

export const galleryItemsSchema = z.object({
  mediaIds: z.array(z.string().cuid()).min(1),
});

export const galleryReorderSchema = z.object({
  orderedIds: z.array(z.string().cuid()),
});
