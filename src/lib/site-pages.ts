/**
 * Pages du site qu'on peut masquer depuis l'admin (Configuration → Navigation).
 * Une page masquée disparaît de la navigation et du pied de page, renvoie une
 * 404 et sort du sitemap. Les bons cadeaux ont leur propre interrupteur
 * (SiteSetting.giftVouchersEnabled), affiché sur le même écran.
 */
export const TOGGLEABLE_PAGES = [
  { key: "house", href: "/la-maison", label: "La maison" },
  { key: "menus", href: "/menus", label: "Cartes & menus" },
  { key: "photos", href: "/photos", label: "Photos" },
  { key: "contact", href: "/contact", label: "Accès & contact" },
  { key: "book", href: "/reservation", label: "Réserver une table" },
] as const;

export type PageKey = (typeof TOGGLEABLE_PAGES)[number]["key"];

export const PAGE_KEYS = TOGGLEABLE_PAGES.map((p) => p.key) as PageKey[];

export function hrefOf(key: PageKey): string {
  return TOGGLEABLE_PAGES.find((p) => p.key === key)!.href;
}
