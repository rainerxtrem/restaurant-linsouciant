import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import type { OpeningDay } from "@/lib/services/settings.service";

const DAY_EN: Record<string, string> = {
  lundi: "Monday",
  mardi: "Tuesday",
  mercredi: "Wednesday",
  jeudi: "Thursday",
  vendredi: "Friday",
  samedi: "Saturday",
  dimanche: "Sunday",
};

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

interface RestaurantLdInput {
  siteName: string;
  description?: string | null;
  addressLine?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  priceRange?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  hours: OpeningDay[];
}

/** JSON-LD schema.org/Restaurant — horaires, adresse, gamme de prix, réseaux. */
export function restaurantJsonLd(input: RestaurantLdInput) {
  const sameAs = [input.facebookUrl, input.instagramUrl].filter((u): u is string => Boolean(u));
  const openingHoursSpecification = input.hours
    .filter((d) => !d.closed && d.slots.length > 0)
    .flatMap((d) =>
      d.slots.map((s) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_EN[d.day] ?? d.day,
        opens: s.start,
        closes: s.end,
      }))
    );

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: input.siteName,
    description: input.description || undefined,
    servesCuisine: "French, contemporary",
    priceRange: input.priceRange || "€€€",
    url: absoluteUrl("/"),
    telephone: input.phone || undefined,
    email: input.email || undefined,
    image: input.imageUrl ? absoluteUrl(input.imageUrl) : undefined,
    menu: absoluteUrl("/menus"),
    acceptsReservations: true,
    address: input.addressLine
      ? {
          "@type": "PostalAddress",
          streetAddress: input.addressLine,
          postalCode: input.postalCode || undefined,
          addressLocality: input.city || undefined,
          addressCountry: "FR",
        }
      : undefined,
    openingHoursSpecification: openingHoursSpecification.length ? openingHoursSpecification : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}
