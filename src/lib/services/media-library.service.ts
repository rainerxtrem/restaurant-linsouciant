import { prisma } from "@/lib/db/prisma";

/** Une ligne de la médiathèque, sérialisable pour le composant client. */
export interface MediaLibraryItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  type: "IMAGE" | "DOCUMENT";
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  altEn: string;
  createdAt: string;
  /** Où le fichier est utilisé (libellés lisibles), vide = inutilisé. */
  usages: string[];
}

const COUNT_LABELS: Record<string, string> = {
  galleryImages: "Galerie photos",
  menuMainFor: "Menu",
  settingsLogoFor: "Réglages : logo",
  settingsFaviconFor: "Réglages : favicon",
  settingsOgFor: "Réglages : image de partage",
  settingsHeroFor: "Réglages : bandeau d'accueil",
  settingsAboutFor: "Réglages : image « En cuisine »",
  announcementFor: "Annonce",
  themePageHeroFor: "Page thématique (bandeau)",
  themeProductFor: "Page thématique (produit)",
  producerFor: "Producteur",
  distinctionFor: "Distinction",
  settingsHomeMainFor: "Accueil : grande photo « En images »",
  settingsHomeSecondFor: "Accueil : petite photo « En images »",
};

export async function listMediaLibrary(): Promise<MediaLibraryItem[]> {
  const [media, pages, announcement, settings] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            galleryImages: true,
            menuMainFor: true,
            settingsLogoFor: true,
            settingsFaviconFor: true,
            settingsOgFor: true,
            settingsHeroFor: true,
            settingsAboutFor: true,
            announcementFor: true,
            themePageHeroFor: true,
            themeProductFor: true,
            producerFor: true,
            distinctionFor: true,
            settingsHomeMainFor: true,
            settingsHomeSecondFor: true,
          },
        },
      },
    }),
    prisma.page.findMany({ select: { title: true, content: true, contentEn: true } }),
    prisma.announcement.findUnique({ where: { id: "singleton" }, select: { content: true, contentEn: true } }),
    prisma.siteSetting.findUnique({ where: { id: "singleton" }, select: { heroVideoUrl: true } }),
  ]);

  return media.map((m) => {
    const usages: string[] = [];
    for (const [key, count] of Object.entries(m._count)) {
      if (count > 0) usages.push(count > 1 ? `${COUNT_LABELS[key]} (×${count})` : COUNT_LABELS[key]!);
    }
    // Références par URL dans les contenus riches (images insérées dans le texte).
    for (const p of pages) {
      if (p.content.includes(m.url) || p.contentEn?.includes(m.url)) usages.push(`Page « ${p.title} »`);
    }
    if (announcement && (announcement.content.includes(m.url) || announcement.contentEn?.includes(m.url))) {
      if (!usages.includes("Annonce")) usages.push("Annonce");
    }
    if (settings?.heroVideoUrl && settings.heroVideoUrl === m.url) usages.push("Réglages : vidéo d'accueil");

    return {
      id: m.id,
      url: m.url,
      filename: m.filename,
      mimeType: m.mimeType,
      type: m.type,
      size: m.size,
      width: m.width,
      height: m.height,
      alt: m.alt ?? "",
      altEn: m.altEn ?? "",
      createdAt: m.createdAt.toISOString(),
      usages,
    };
  });
}

export function updateMediaAlt(id: string, alt: string, altEn: string) {
  return prisma.media.update({
    where: { id },
    data: { alt: alt.trim() || null, altEn: altEn.trim() || null },
  });
}
