import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { getHiddenHrefs } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/menus", "/photos", "/contact", "/reservation"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pagePaths: string[] = [];
  let giftVouchersEnabled = true;
  let themePaths: string[] = [];
  let hidden: string[] = [];
  try {
    const pages = await prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    pagePaths = pages.map((p) => `/${p.slug}`);
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "singleton" },
      select: { giftVouchersEnabled: true },
    });
    giftVouchersEnabled = settings?.giftVouchersEnabled ?? true;
    const themes = await prisma.themePage.findMany({ where: { enabled: true }, select: { slug: true } });
    themePaths = themes.map((t) => `/${t.slug}`);
    hidden = await getHiddenHrefs();
  } catch {
    // base non joignable au build — sitemap statique suffisant
  }

  const all = [...STATIC_PATHS, "/la-maison", ...(giftVouchersEnabled ? ["/bons-cadeaux"] : []), ...themePaths, ...pagePaths]
    .filter((path, i, arr) => arr.indexOf(path) === i)
    .filter((path) => !hidden.includes(path));

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
