import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "L'Insouciant";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** Chemin localisé : `/menus` en FR, `/en/menus` en EN. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return locale === "fr" ? path : `/en${clean}`;
}

/**
 * Socle de métadonnées cohérent (titre, description, canonical, hreflang,
 * Open Graph, Twitter) pour une page publique bilingue.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  titleIsAbsolute = false,
}: {
  locale: Locale;
  /** Chemin non localisé, ex. "/menus" ou "/". */
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  titleIsAbsolute?: boolean;
}): Metadata {
  const url = absoluteUrl(localizedPath(path, locale));
  const desc = description || undefined;

  return {
    title: titleIsAbsolute ? { absolute: title } : title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        fr: absoluteUrl(localizedPath(path, "fr")),
        en: absoluteUrl(localizedPath(path, "en")),
        "x-default": absoluteUrl(localizedPath(path, "fr")),
      },
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}
