import type { MenuView } from "@/components/site/menu-selector";

interface MenuRow {
  slug: string;
  name: string;
  nameEn: string | null;
  availabilityNote: string | null;
  availabilityNoteEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  prices: { id: string; kind: MenuView["prices"][number]["kind"]; label: string; labelEn: string | null; priceCents: number }[];
  sections: {
    id: string;
    title: string;
    titleEn: string | null;
    subtitle: string | null;
    subtitleEn: string | null;
    dishes: { id: string; name: string; nameEn: string | null; description: string | null; descriptionEn: string | null }[];
  }[];
}

/** Réduit un menu Prisma à la forme sérialisable attendue par MenuSelector. */
export function toMenuView(m: MenuRow): MenuView {
  return {
    slug: m.slug,
    name: m.name,
    nameEn: m.nameEn,
    availabilityNote: m.availabilityNote,
    availabilityNoteEn: m.availabilityNoteEn,
    description: m.description,
    descriptionEn: m.descriptionEn,
    prices: m.prices.map((p) => ({
      id: p.id,
      kind: p.kind,
      label: p.label,
      labelEn: p.labelEn,
      priceCents: p.priceCents,
    })),
    sections: m.sections.map((s) => ({
      id: s.id,
      title: s.title,
      titleEn: s.titleEn,
      subtitle: s.subtitle,
      subtitleEn: s.subtitleEn,
      dishes: s.dishes.map((d) => ({
        id: d.id,
        name: d.name,
        nameEn: d.nameEn,
        description: d.description,
        descriptionEn: d.descriptionEn,
      })),
    })),
  };
}
