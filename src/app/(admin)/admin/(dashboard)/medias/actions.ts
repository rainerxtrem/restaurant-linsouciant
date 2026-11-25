"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/permissions";
import { updateMediaAlt } from "@/lib/services/media-library.service";
import { deleteMedia } from "@/lib/services/media.service";

const altSchema = z.object({
  id: z.string().min(1),
  alt: z.string().max(300),
  altEn: z.string().max(300),
});

export async function updateMediaAltAction(input: { id: string; alt: string; altEn: string }) {
  await requireAdmin();
  const parsed = altSchema.safeParse(input);
  if (!parsed.success) return { error: "Texte trop long (300 caractères max)." };
  await updateMediaAlt(parsed.data.id, parsed.data.alt, parsed.data.altEn);
  revalidatePath("/admin/medias");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteMediaAction(id: string) {
  await requireAdmin();
  await deleteMedia(id);
  revalidatePath("/admin/medias");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
