import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { getSiteSettings, parseOpeningHours } from "@/lib/services/settings.service";
import { listPublishedMenus } from "@/lib/services/menu.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { Reveal } from "@/components/public/reveal";
import { OpeningHours } from "@/components/site/opening-hours";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings();
  return buildMetadata({
    locale,
    path: "/",
    title: settings.seoDefaultTitle || `${settings.siteName} — ${settings.tagline}`,
    description:
      settings.seoDefaultDescription ||
      localized(settings, "intro", locale) ||
      settings.tagline,
    image: settings.ogImage?.url ?? settings.heroImage?.url,
    titleIsAbsolute: true,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [settings, menus, albums] = await Promise.all([
    getSiteSettings(),
    listPublishedMenus(),
    listAlbumsWithImages(),
  ]);
  const hours = parseOpeningHours(settings.openingHours);
  const photos = albums.flatMap((a) => a.images).slice(0, 6);
  const siteName = locale === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;
  const tagline = locale === "en" && settings.taglineEn ? settings.taglineEn : settings.tagline;

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[86vh] items-center overflow-hidden bg-ink-950 text-cream-50">
        {settings.heroImage ? (
          <Image src={settings.heroImage.url} alt="" fill priority className="object-cover opacity-50" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/70" />
        <div className="container relative z-10 py-32 text-center">
          <Reveal>
            <p className="eyebrow justify-center text-gold-300 before:bg-gold-300">Le Mans</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mx-auto mt-6 max-w-4xl font-display text-6xl font-light leading-[1.03] tracking-tight sm:text-7xl">
              {siteName}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl font-display text-xl italic text-gold-200">{tagline}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/reservation" className="btn-cta">
                {t("home.bookTable")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/menus"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-cream-100/40 px-6 py-3 text-sm font-medium tracking-wide text-cream-50 transition-all hover:border-cream-50 hover:bg-cream-50/10"
              >
                {t("home.discoverMenus")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Philosophie / chef */}
      {localized(settings, "intro", locale) ? (
        <section className="bg-cream-100 py-24 sm:py-32">
          <div className="container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <Reveal>
              <div>
                <p className="eyebrow">{t("home.chefTitle")}</p>
                <h2 className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">{tagline}</h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="prose prose-sm max-w-none text-ink-700 sm:prose-base">
                {localized(settings, "intro", locale)
                  .split(/\n{2,}/)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Menus */}
      {menus.length > 0 ? (
        <section className="relative overflow-hidden bg-ink-950 py-24 text-cream-100 sm:py-32">
          <div className="pointer-events-none absolute inset-0 bg-grain" />
          <div className="container relative">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal>
                <p className="eyebrow justify-center text-gold-300 before:bg-gold-300">
                  {t("home.menusTitle")}
                </p>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-4 font-display text-2xl text-cream-50 sm:text-3xl">
                  {t("home.menusIntro")}
                </p>
              </Reveal>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {menus.map((menu, i) => (
                <Reveal key={menu.id} delay={(i % 2) * 100}>
                  <Link
                    href={{ pathname: "/menus", hash: `menu-${menu.slug}` }}
                    className="group flex h-full flex-col justify-between rounded-md border border-cream-50/10 bg-cream-50/5 p-8 transition-colors hover:border-gold-400/50"
                  >
                    <div>
                      <h3 className="font-display text-2xl text-cream-50">{localized(menu, "name", locale)}</h3>
                      {localized(menu, "availabilityNote", locale) ? (
                        <p className="mt-2 text-xs uppercase tracking-wide text-gold-300">
                          {localized(menu, "availabilityNote", locale)}
                        </p>
                      ) : null}
                      {localized(menu, "description", locale) ? (
                        <p className="mt-4 text-sm text-cream-100/70">
                          {localized(menu, "description", locale)}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-gold-300">
                      {t("common.readMore")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Photos */}
      {photos.length > 0 ? (
        <section className="bg-cream-100 py-24">
          <div className="container">
            <div className="flex items-end justify-between">
              <Reveal>
                <p className="eyebrow">{t("home.photosTitle")}</p>
              </Reveal>
              <Link href="/photos" className="link-sweep text-sm text-wine-700">
                {t("home.photosLink")}
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-sm">
                  <Image
                    src={img.media.url}
                    alt={img.media.alt ?? ""}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Nous trouver */}
      <section className="border-t border-ink-900/10 bg-cream-50 py-24">
        <div className="container grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <div>
              <p className="eyebrow">{t("home.findUsTitle")}</p>
              <h2 className="mt-4 font-display text-3xl text-ink-900">{siteName}</h2>
              <address className="mt-4 space-y-1 not-italic text-ink-700">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gold-600" aria-hidden />
                  <span>
                    {settings.addressLine}
                    <br />
                    {settings.postalCode} {settings.city}
                  </span>
                </p>
                {settings.phone ? (
                  <p>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-sweep text-wine-700">
                      {settings.phone}
                    </a>
                  </p>
                ) : null}
              </address>
              <div className="mt-6">
                <OpeningHours hours={hours} />
              </div>
              <Link href="/contact" className="btn-cta mt-8">
                {t("nav.contact")}
              </Link>
            </div>
          </Reveal>
          {settings.mapEmbedUrl ? (
            <Reveal delay={120}>
              <div className="aspect-[4/3] overflow-hidden rounded-md shadow-card">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={siteName}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>
    </div>
  );
}
