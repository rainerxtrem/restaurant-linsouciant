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

/**
 * Entrées ordonnables du menu (l'Accueil reste toujours en tête du menu).
 * « themes » = bloc des pages thématiques activées (Noël…).
 */
export const NAV_ORDER_KEYS = ["house", "menus", "themes", "photos", "giftVouchers", "contact", "book"] as const;
export type NavKey = (typeof NAV_ORDER_KEYS)[number];

export const NAV_HREFS: Record<Exclude<NavKey, "themes">, string> = {
  house: "/la-maison",
  menus: "/menus",
  photos: "/photos",
  giftVouchers: "/bons-cadeaux",
  contact: "/contact",
  book: "/reservation",
};

/** Ordre enregistré, nettoyé (clés inconnues retirées, manquantes ajoutées). */
export function resolveNavOrder(stored: readonly string[] | null | undefined): NavKey[] {
  const valid = (stored ?? []).filter((k, i, arr): k is NavKey =>
    (NAV_ORDER_KEYS as readonly string[]).includes(k) && arr.indexOf(k) === i
  );
  const missing = NAV_ORDER_KEYS.filter((k) => !valid.includes(k));
  return [...valid, ...missing];
}
