import slugify from "slugify";
import { prisma } from "@/lib/db/prisma";

export function slugifyText(input: string): string {
  // Les apostrophes doivent séparer les mots ("L'Insouciant" -> "l-insouciant").
  const withoutApostrophes = input.replace(/['’]/g, " ");
  return slugify(withoutApostrophes, { lower: true, strict: true, locale: "fr" });
}

type SlugModel = "menu" | "page" | "galleryAlbum";

export async function ensureUniqueSlug(
  model: SlugModel,
  base: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugifyText(base) || "sans-titre";
  let candidate = baseSlug;
  let attempt = 1;

  while (await slugExists(model, candidate, excludeId)) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
  return candidate;
}

async function slugExists(model: SlugModel, slug: string, excludeId?: string): Promise<boolean> {
  const row =
    model === "menu"
      ? await prisma.menu.findUnique({ where: { slug }, select: { id: true } })
      : model === "page"
        ? await prisma.page.findUnique({ where: { slug }, select: { id: true } })
        : await prisma.galleryAlbum.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(row && row.id !== excludeId);
}
