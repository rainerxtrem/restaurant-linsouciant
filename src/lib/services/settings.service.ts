import { prisma } from "@/lib/db/prisma";
import { cache } from "react";
import { PAGE_KEYS, hrefOf, type PageKey } from "@/lib/site-pages";

const include = {
  logo: true,
  favicon: true,
  ogImage: true,
  heroImage: true,
  aboutImage: true,
  homePhotoMain: true,
  homePhotoSecond: true,
} as const;

/**
 * Réglages du site (singleton). `cache()` déduplique les appels au sein d'un
 * même rendu (layout + page + composants le demandent tous).
 */
export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" }, include });
  if (settings) return settings;
  return prisma.siteSetting.create({ data: { id: "singleton" }, include });
});

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

export interface OpeningSlot {
  start: string;
  end: string;
}
export interface OpeningDay {
  day: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
  closed: boolean;
  slots: OpeningSlot[];
}

export function parseOpeningHours(value: unknown): OpeningDay[] {
  if (!Array.isArray(value)) return [];
  return value as OpeningDay[];
}

/**
 * Adresses masquées du site public : pages désactivées dans l'admin, « La
 * maison » si sa page de contenu est en brouillon, bons cadeaux désactivés.
 */
export const getHiddenHrefs = cache(async (): Promise<string[]> => {
  const [settings, house] = await Promise.all([
    getSiteSettings(),
    prisma.page.findUnique({ where: { slug: "la-maison" }, select: { status: true } }),
  ]);
  const disabled = new Set(settings.disabledPages.filter((k): k is PageKey => (PAGE_KEYS as string[]).includes(k)));
  if (!house || house.status !== "PUBLISHED") disabled.add("house");
  const hrefs = [...disabled].map(hrefOf);
  if (!settings.giftVouchersEnabled) hrefs.push("/bons-cadeaux");
  return hrefs;
});

/** true si la page est désactivée (à appeler en tête de page → notFound()). */
export async function isPageDisabled(key: PageKey): Promise<boolean> {
  return (await getHiddenHrefs()).includes(hrefOf(key));
}
