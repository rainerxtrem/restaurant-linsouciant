import { prisma } from "@/lib/db/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import type { MenuInput } from "@/lib/validation/menu";

const fullInclude = {
  mainImage: true,
  prices: { orderBy: { order: "asc" } },
  sections: {
    orderBy: { order: "asc" },
    include: { dishes: { orderBy: { order: "asc" } } },
  },
} as const;

/** Menus de la carte principale (hors menus rattachés à une page thématique). */
export function listPublishedMenus() {
  return prisma.menu.findMany({
    where: { status: "PUBLISHED", themePageId: null },
    orderBy: { order: "asc" },
    include: fullInclude,
  });
}

export function listAllMenus() {
  return prisma.menu.findMany({
    orderBy: { order: "asc" },
    include: { ...fullInclude, themePage: { select: { title: true } } },
  });
}

export function getMenu(id: string) {
  return prisma.menu.findUnique({ where: { id }, include: fullInclude });
}

export type MenuWithRelations = NonNullable<Awaited<ReturnType<typeof getMenu>>>;

/** Crée ou remplace un menu et l'intégralité de ses prix / sections / plats. */
export async function upsertMenu(input: MenuInput, id?: string) {
  const slug = await ensureUniqueSlug("menu", input.name, id);
  const publishedAt =
    input.status === "PUBLISHED" ? ((id && (await prisma.menu.findUnique({ where: { id } }))?.publishedAt) ?? new Date()) : null;

  const data = {
    slug,
    name: input.name,
    nameEn: input.nameEn || null,
    description: input.description || null,
    descriptionEn: input.descriptionEn || null,
    availabilityNote: input.availabilityNote || null,
    availabilityNoteEn: input.availabilityNoteEn || null,
    mainImageId: input.mainImageId ?? null,
    themePageId: input.themePageId ?? null,
    status: input.status,
    order: input.order,
    publishedAt,
  };

  return prisma.$transaction(async (tx) => {
    const menu = id
      ? await tx.menu.update({ where: { id }, data })
      : await tx.menu.create({ data });

    // Remplacement complet : plus simple et sans risque de désync que du diff.
    await tx.menuPrice.deleteMany({ where: { menuId: menu.id } });
    await tx.menuSection.deleteMany({ where: { menuId: menu.id } });

    await tx.menuPrice.createMany({
      data: input.prices.map((p, order) => ({
        menuId: menu.id,
        kind: p.kind,
        label: p.label,
        labelEn: p.labelEn || null,
        priceCents: p.priceCents,
        order,
      })),
    });

    for (const [order, section] of input.sections.entries()) {
      const created = await tx.menuSection.create({
        data: {
          menuId: menu.id,
          title: section.title,
          titleEn: section.titleEn || null,
          subtitle: section.subtitle || null,
          subtitleEn: section.subtitleEn || null,
          order,
        },
      });
      if (section.dishes.length > 0) {
        await tx.menuDish.createMany({
          data: section.dishes.map((d, dishOrder) => ({
            sectionId: created.id,
            name: d.name,
            nameEn: d.nameEn || null,
            description: d.description || null,
            descriptionEn: d.descriptionEn || null,
            order: dishOrder,
          })),
        });
      }
    }

    return menu;
  });
}

export function deleteMenu(id: string) {
  return prisma.menu.delete({ where: { id } });
}

/**
 * Duplique un menu (prix, sections, plats) en brouillon, rattaché au même
 * endroit (carte principale ou page thématique), sauf `themePageId` fourni.
 */
export async function duplicateMenu(id: string, options: { themePageId?: string | null; keepStatus?: boolean } = {}) {
  const menu = await getMenu(id);
  if (!menu) throw new Error("Menu introuvable");
  return upsertMenu({
    name: options.keepStatus ? menu.name : `${menu.name} (copie)`,
    nameEn: menu.nameEn ?? "",
    description: menu.description ?? "",
    descriptionEn: menu.descriptionEn ?? "",
    availabilityNote: menu.availabilityNote ?? "",
    availabilityNoteEn: menu.availabilityNoteEn ?? "",
    mainImageId: menu.mainImageId,
    themePageId: options.themePageId !== undefined ? options.themePageId : menu.themePageId,
    status: options.keepStatus ? menu.status : "DRAFT",
    order: menu.order,
    prices: menu.prices.map((p) => ({ kind: p.kind, label: p.label, labelEn: p.labelEn ?? "", priceCents: p.priceCents })),
    sections: menu.sections.map((s) => ({
      title: s.title,
      titleEn: s.titleEn ?? "",
      subtitle: s.subtitle ?? "",
      subtitleEn: s.subtitleEn ?? "",
      dishes: s.dishes.map((d) => ({
        name: d.name,
        nameEn: d.nameEn ?? "",
        description: d.description ?? "",
        descriptionEn: d.descriptionEn ?? "",
      })),
    })),
  });
}
