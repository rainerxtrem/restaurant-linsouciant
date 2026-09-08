import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/menus", "/photos", "/contact", "/reservation", "/bons-cadeaux"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pagePaths: string[] = [];
  try {
    const pages = await prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    pagePaths = pages.map((p) => `/${p.slug}`);
  } catch {
    // base non joignable au build — sitemap statique suffisant
  }

  const all = [...STATIC_PATHS, ...pagePaths];

  return all.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(path, locale)),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, absoluteUrl(localizedPath(path, l))])
        ),
      },
    }))
  );
}
