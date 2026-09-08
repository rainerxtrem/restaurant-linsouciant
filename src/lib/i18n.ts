import type { Locale } from "@/i18n/routing";

/**
 * Renvoie la valeur traduite d'un champ de contenu dynamique. Convention :
 * le champ français porte le nom de base (`name`, `description`…), l'anglais
 * le même nom suffixé `En` (`nameEn`…). Quand l'anglais est vide, on retombe
 * sur le français plutôt que d'afficher un trou.
 */
export function localized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale
): string {
  const base = (row[field] as string | null | undefined) ?? "";
  if (locale === "fr") return base;
  const en = row[`${field}En`] as string | null | undefined;
  return en && en.trim().length > 0 ? en : base;
}
