"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/permissions";
import { ensureUniqueSlug } from "@/lib/slug";
import { galleryAlbumSchema } from "@/lib/validation/gallery";
import { addImagesToAlbum, reorderAlbumImages } from "@/lib/services/gallery.service";

export async function createAlbumAction(formData: FormData) {
  await requireAdmin();
  const parsed = galleryAlbumSchema.parse({
    title: formData.get("title"),
    titleEn: formData.get("titleEn") ?? "",
    order: formData.get("order") ?? 0,
  });
  const slug = await ensureUniqueSlug("galleryAlbum", parsed.title);
  const album = await prisma.galleryAlbum.create({
    data: { slug, title: parsed.title, titleEn: parsed.titleEn || null, order: parsed.order },
  });
  revalidatePath("/admin/photos");
  revalidatePath("/photos");
  redirect(`/admin/photos/${album.id}`);
}

export async function deleteAlbumAction(formData: FormData) {
  await requireAdmin();
  await prisma.galleryAlbum.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/photos");
  revalidatePath("/photos");
}

export async function addImagesAction(albumId: string, mediaIds: string[]) {
  await requireAdmin();
  await addImagesToAlbum(albumId, mediaIds);
  revalidatePath(`/admin/photos/${albumId}`);
  revalidatePath("/photos");
}

export async function removeImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const image = await prisma.galleryImage.delete({ where: { id } });
  revalidatePath(`/admin/photos/${image.albumId}`);
  revalidatePath("/photos");
}

export async function reorderImagesAction(albumId: string, orderedIds: string[]) {
  await requireAdmin();
  await reorderAlbumImages(albumId, orderedIds);
  revalidatePath(`/admin/photos/${albumId}`);
  revalidatePath("/photos");
}
