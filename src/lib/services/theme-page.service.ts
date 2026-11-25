import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { slugifyText } from "@/lib/slug";
import { parseProductPrices, THEME_PAGE_STYLES, type ThemePageInput, type ThemePageStyle } from "@/lib/validation/theme-page";
import { duplicateMenu } from "@/lib/services/menu.service";

/** Premiers segments d'URL déjà pris par des routes du site. */
const RESERVED_SLUGS = new Set([
  "en",
  "fr",
  "admin",
  "api",
  "media",
  "menus",
  "photos",
  "contact",
  "reservation",
  "bons-cadeaux",
  "la-maison",
  "newsletter",
  "sitemap.xml",
  "robots.txt",
  "manifest.webmanifest",
]);

export class ThemePageSlugError extends Error {}

const fullInclude = {
  heroImage: true,
  products: { orderBy: { order: "asc" }, include: { image: true } },
  menus: {
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      prices: { orderBy: { order: "asc" } },
      sections: { orderBy: { order: "asc" }, include: { dishes: { orderBy: { order: "asc" } } } },
    },
  },
} as const;

export function listAllThemePages() {
  return prisma.themePage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true, menus: true } } },
  });
}

/** Pages activées, pour le menu du site et le sitemap (dédupliqué par rendu). */
export const listEnabledThemePages = cache(() =>
  prisma.themePage.findMany({
    where: { enabled: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { slug: true, title: true, titleEn: true, navLabel: true, navLabelEn: true },
  })
);

export function getThemePage(id: string) {
  return prisma.themePage.findUnique({
    where: { id },
    include: { heroImage: true, products: { orderBy: { order: "asc" }, include: { image: true } } },
  });
}

export type ThemePageWithProducts = NonNullable<Awaited<ReturnType<typeof getThemePage>>>;

export const getEnabledThemePageBySlug = cache((slug: string) =>
  prisma.themePage.findFirst({ where: { slug, enabled: true }, include: fullInclude })
);

async function resolveSlug(input: ThemePageInput, id?: string): Promise<string> {
  const wanted = slugifyText(input.slug || input.title) || "page";
  const taken = async (slug: string) => {
    if (RESERVED_SLUGS.has(slug)) return true;
    const [page, theme] = await Promise.all([
      prisma.page.findUnique({ where: { slug }, select: { id: true } }),
      prisma.themePage.findUnique({ where: { slug }, select: { id: true } }),
    ]);
    return Boolean(page) || Boolean(theme && theme.id !== id);
  };

  // Adresse choisie explicitement : on refuse plutôt que de la modifier en douce.
  if (input.slug) {
    if (await taken(wanted)) {
      throw new ThemePageSlugError(`L'adresse « /${wanted} » est déjà utilisée par une autre page.`);
    }
    return wanted;
  }
  let candidate = wanted;
  for (let n = 2; await taken(candidate); n++) candidate = `${wanted}-${n}`;
  return candidate;
}

/** Crée ou remplace une page thématique et l'intégralité de ses produits. */
export async function upsertThemePage(input: ThemePageInput, id?: string) {
  const slug = await resolveSlug(input, id);
  const data = {
    slug,
    title: input.title,
    titleEn: input.titleEn || null,
    navLabel: input.navLabel || null,
    navLabelEn: input.navLabelEn || null,
    intro: input.intro || null,
    introEn: input.introEn || null,
    orderInfo: input.orderInfo || null,
    orderInfoEn: input.orderInfoEn || null,
    orderUrl: input.orderUrl || null,
    heroImageId: input.heroImageId ?? null,
    enabled: input.enabled,
    style: input.style,
    order: input.order,
  };

  return prisma.$transaction(async (tx) => {
    const page = id
      ? await tx.themePage.update({ where: { id }, data })
      : await tx.themePage.create({ data });

    await tx.themeProduct.deleteMany({ where: { themePageId: page.id } });
    if (input.products.length > 0) {
      await tx.themeProduct.createMany({
        data: input.products.map((p, order) => ({
          themePageId: page.id,
          name: p.name,
          nameEn: p.nameEn || null,
          description: p.description || null,
          descriptionEn: p.descriptionEn || null,
          imageId: p.imageId ?? null,
          prices: p.prices
            .filter((x) => x.label || x.priceCents > 0)
            .map((x) => ({ label: x.label, labelEn: x.labelEn || "", priceCents: x.priceCents })),
          order,
        })),
      });
    }
    return page;
  });
}

export function setThemePageEnabled(id: string, enabled: boolean) {
  return prisma.themePage.update({ where: { id }, data: { enabled } });
}

/**
 * Supprime la page. Ses menus repassent en brouillon (sinon, détachés, ils
 * apparaîtraient d'un coup sur la carte principale).
 */
export function deleteThemePage(id: string) {
  return prisma.$transaction([
    prisma.menu.updateMany({ where: { themePageId: id }, data: { themePageId: null, status: "DRAFT" } }),
    prisma.themePage.delete({ where: { id } }),
  ]);
}

/**
 * Duplique une page thématique (ex. repartir du Noël de l'an dernier) :
 * textes, photos, produits et menus rattachés. La copie est désactivée et
 * reçoit sa propre adresse ; ses menus gardent leur statut (ils restent
 * invisibles tant que la page n'est pas activée).
 */
export async function duplicateThemePage(id: string) {
  const page = await prisma.themePage.findUnique({
    where: { id },
    include: { products: { orderBy: { order: "asc" } }, menus: { select: { id: true } } },
  });
  if (!page) throw new Error("Page thématique introuvable");

  const style: ThemePageStyle = (THEME_PAGE_STYLES as readonly string[]).includes(page.style)
    ? (page.style as ThemePageStyle)
    : "classic";

  const copy = await upsertThemePage({
    title: `${page.title} (copie)`,
    titleEn: page.titleEn ?? "",
    slug: "",
    navLabel: page.navLabel ?? "",
    navLabelEn: page.navLabelEn ?? "",
    intro: page.intro ?? "",
    introEn: page.introEn ?? "",
    orderInfo: page.orderInfo ?? "",
    orderInfoEn: page.orderInfoEn ?? "",
    orderUrl: page.orderUrl ?? "",
    heroImageId: page.heroImageId,
    enabled: false,
    style,
    order: page.order,
    products: page.products.map((p) => ({
      name: p.name,
      nameEn: p.nameEn ?? "",
      description: p.description ?? "",
      descriptionEn: p.descriptionEn ?? "",
      imageId: p.imageId,
      prices: parseProductPrices(p.prices).map((x) => ({ ...x, labelEn: x.labelEn ?? "" })),
    })),
  });

  for (const menu of page.menus) {
    await duplicateMenu(menu.id, { themePageId: copy.id, keepStatus: true });
  }
  return copy;
}
