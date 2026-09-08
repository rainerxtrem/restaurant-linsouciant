import { prisma } from "@/lib/db/prisma";

export function getPublishedPage(slug: string) {
  return prisma.page.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export function listPages() {
  return prisma.page.findMany({ orderBy: { title: "asc" } });
}

export function getPage(id: string) {
  return prisma.page.findUnique({ where: { id } });
}

/** Pages structurelles présentes dans le pied de page. */
export const SYSTEM_PAGE_SLUGS = [
  "mentions-legales",
  "politique-de-confidentialite",
  "politique-cookies",
  "accessibilite",
  "cgv",
] as const;
