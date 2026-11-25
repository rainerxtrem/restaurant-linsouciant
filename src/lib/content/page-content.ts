import { cache } from "react";
import { getTranslations } from "next-intl/server";
import type { Media } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/services/settings.service";
import { allFields, getPageDef, type ImageField, type TextDefault, type TextField } from "@/lib/content/pages";

/** Valeur stockée pour un champ dans PageContent.data. */
export type StoredValue = { fr?: string; en?: string; mediaId?: string | null };
export type StoredData = Record<string, StoredValue>;

export const getStoredContent = cache(async (key: string): Promise<StoredData> => {
  const row = await prisma.pageContent.findUnique({ where: { key } });
  return (row?.data as StoredData | null) ?? {};
});

/** Texte par défaut d'un champ, dans une langue. */
export async function resolveDefault(def: TextDefault | undefined, locale: Locale): Promise<string> {
  if (!def) return "";
  if ("msg" in def) {
    const t = await getTranslations({ locale });
    return t.has(def.msg) ? t(def.msg) : "";
  }
  return def[locale] ?? def.fr;
}

export interface PageContent {
  /** Texte du champ : modifié dans l'admin, sinon texte d'origine. */
  text(key: string): string;
  /** Photo du champ, ou null (la page applique alors sa photo par défaut). */
  image(key: string): Media | null;
}

/**
 * Contenu d'une page du site pour une langue. Ordre de priorité d'un texte :
 * valeur modifiée dans l'admin (dans la langue) → réglage associé (anglais
 * retombant sur le français) → texte d'origine.
 */
export const getPageContent = cache(async (pageKey: string, locale: Locale): Promise<PageContent> => {
  const def = getPageDef(pageKey);
  if (!def) throw new Error(`Page de contenu inconnue : ${pageKey}`);
  const [stored, settings] = await Promise.all([getStoredContent(pageKey), getSiteSettings()]);
  const s = settings as unknown as Record<string, unknown>;
  const fields = allFields(def);

  const texts = new Map<string, string>();
  const mediaIds = new Map<string, string>();

  for (const field of fields) {
    if (field.type === "link") continue;
    if (field.type === "image") {
      const f = field as ImageField;
      const id = f.setting ? (s[f.setting] as string | null) : (stored[f.key]?.mediaId ?? null);
      if (id) mediaIds.set(f.key, id);
      continue;
    }
    const f = field as TextField;
    let value = "";
    if (f.setting) {
      const fr = (s[f.setting.fr] as string | null) ?? "";
      const en = f.setting.en ? ((s[f.setting.en] as string | null) ?? "") : "";
      value = locale === "en" && en.trim() ? en : fr;
    } else {
      const override = stored[f.key]?.[locale];
      value = override && override.trim() ? override : await resolveDefault(f.default, locale);
    }
    texts.set(f.key, value);
  }

  const media = mediaIds.size
    ? await prisma.media.findMany({ where: { id: { in: [...new Set(mediaIds.values())] } } })
    : [];
  const byId = new Map(media.map((m) => [m.id, m]));

  return {
    text: (key) => texts.get(key) ?? "",
    image: (key) => {
      const id = mediaIds.get(key);
      return id ? (byId.get(id) ?? null) : null;
    },
  };
});
