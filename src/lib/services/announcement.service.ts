import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

const include = { image: true } as const;

export const getAnnouncement = cache(async () => {
  const row = await prisma.announcement.findUnique({ where: { id: "singleton" }, include });
  if (row) return row;
  return prisma.announcement.create({ data: { id: "singleton" }, include });
});

export type Announcement = Awaited<ReturnType<typeof getAnnouncement>>;

/** L'annonce à afficher au visiteur, ou null (désactivée / hors période / vide). */
export async function getActiveAnnouncement() {
  const a = await getAnnouncement();
  if (!a.enabled) return null;
  const now = Date.now();
  if (a.startsAt && a.startsAt.getTime() > now) return null;
  if (a.endsAt && a.endsAt.getTime() < now) return null;
  const hasContent = (a.content && a.content.replace(/<[^>]*>/g, "").trim().length > 0) || a.image;
  if (!hasContent) return null;
  return a;
}
