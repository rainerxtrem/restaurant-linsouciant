import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

const include = { logo: true, favicon: true, ogImage: true, heroImage: true, aboutImage: true } as const;

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
