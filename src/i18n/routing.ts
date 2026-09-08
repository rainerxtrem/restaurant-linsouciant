import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Le français reste à la racine (/menus), l'anglais est préfixé (/en/menus)
  // — c'est le comportement de l'ancien site restaurant-linsouciant.fr.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
