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
import { HeroBackground } from "@/components/site/hero-background";

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
      settings.seoDefaultDescription || localized(settings, "intro", locale) || settings.tagline,
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
  const restaurantShot =
    albums.find((a) => a.slug === "le-restaurant")?.images[0]?.media ??
    albums.flatMap((a) => a.images)[0]?.media ??
    null;
  const dishShot =
    albums.find((a) => a.slug === "les-plats")?.images[0]?.media ??
    albums.flatMap((a) => a.images)[1]?.media ??
    null;
  const siteName = locale === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;
  const tagline = locale === "en" && settings.taglineEn ? settings.taglineEn : settings.tagline;

  return (
    <div className="bg-cream-50">
      {/* ---------------------------------------------------------------- */}
      {/* Hero plein écran — vidéo (ou image) en fond, nom centré          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-ink-950 text-cream-50">
        {settings.heroVideoUrl ? (
          <HeroBackground videoUrl={settings.heroVideoUrl} posterUrl={settings.heroImage?.url} />
        ) : settings.heroImage ? (
          <Image
            src={settings.heroImage.url}
            alt=""
            fill
            priority
            className="hero-kenburns object-cover opacity-55"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-grain opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/25 to-ink-950/80" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <Reveal>
            <Image
              src="/logo-light.png"
              alt={siteName}
              width={760}
              height={350}
              priority
              className="h-auto w-[280px] sm:w-[420px] lg:w-[500px]"
            />
          </Reveal>
          <Reveal delay={200}>
            <span className="mt-8 h-px w-14 bg-gold-400/70" />
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.4em] text-cream-100/80">
              {settings.city ? `${settings.city} · ` : ""}
              {tagline}
            </p>
          </Reveal>
          <Reveal delay={340}>
            <Link
              href="/reservation"
              className="mt-10 inline-block border-b border-cream-50/40 pb-1 text-sm tracking-wide text-cream-50 transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              {t("home.bookTable")}
            </Link>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="cue-line block h-10 w-px origin-top bg-cream-50/50" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Philosophie / chef                                              */}
      {/* ---------------------------------------------------------------- */}
      {localized(settings, "intro", locale) ? (
        <section className="py-28 sm:py-40">
          <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            {settings.aboutImage ? (
              <Reveal>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={settings.aboutImage.url}
                    alt={settings.aboutImage.alt ?? "Corentin Courtien"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            ) : null}
            <Reveal delay={120}>
              <div className="max-w-lg">
                <p className="kicker">{t("home.chefTitle")}</p>
                <h2 className="mt-5 font-display text-3xl font-light leading-tight text-ink-900 sm:text-[2.6rem]">
                  {tagline}
                </h2>
                <div className="prose prose-sm mt-7 max-w-none text-ink-600 sm:prose-base">
                  {localized(settings, "intro", locale)
                    .split(/\n{2,}/)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Menus                                                           */}
      {/* ---------------------------------------------------------------- */}
      {menus.length > 0 ? (
        <section className="border-y border-ink-900/10 bg-cream-100 py-28 sm:py-36">
          <div className="container max-w-5xl">
            <Reveal>
              <div className="text-center">
                <p className="kicker">{t("home.menusTitle")}</p>
                <p className="mx-auto mt-5 max-w-xl font-display text-2xl font-light text-ink-900 sm:text-3xl">
                  {t("home.menusIntro")}
                </p>
              </div>
            </Reveal>
            <div className="mt-16 grid gap-px overflow-hidden border border-ink-900/10 bg-ink-900/10 sm:grid-cols-2">
              {menus.map((menu, i) => (
                <Reveal key={menu.id} delay={(i % 2) * 100} className="h-full">
                  <Link
                    href={{ pathname: "/menus", hash: `menu-${menu.slug}` }}
                    className="group flex h-full flex-col justify-between bg-cream-50 p-8 transition-colors hover:bg-white sm:p-10"
                  >
                    <div>
                      {localized(menu, "availabilityNote", locale) ? (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold-600">
                          {localized(menu, "availabilityNote", locale)}
                        </p>
                      ) : null}
                      <h3 className="mt-3 font-display text-2xl font-light text-ink-900">
                        {localized(menu, "name", locale)}
                      </h3>
                      {localized(menu, "description", locale) ? (
                        <p className="mt-4 text-sm leading-relaxed text-ink-600">
                          {localized(menu, "description", locale)}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-wine-700">
                      {t("common.readMore")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Photos — deux images superposées + texte                        */}
      {/* ---------------------------------------------------------------- */}
      {restaurantShot ? (
        <section className="overflow-hidden py-28 sm:py-36">
          <div className="container grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
            <Reveal>
              <div className="relative">
                <div className="relative aspect-[4/3] w-[85%] overflow-hidden">
                  <Image
                    src={restaurantShot.url}
                    alt={restaurantShot.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 45vw"
                  />
                </div>
                {dishShot ? (
                  <div className="absolute -bottom-10 right-0 aspect-[3/4] w-[45%] overflow-hidden border-[6px] border-cream-50 shadow-elevated sm:-bottom-14">
                    <Image
                      src={dishShot.url}
                      alt={dishShot.alt ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 45vw, 22vw"
                    />
                  </div>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="max-w-md lg:pl-6">
                <p className="kicker">{t("home.photosTitle")}</p>
                <p className="mt-5 font-display text-2xl font-light leading-snug text-ink-900 sm:text-[2rem]">
                  {t("home.photosIntro")}
                </p>
                <Link
                  href="/photos"
                  className="mt-8 inline-block border-b border-ink-900/30 pb-1 text-xs uppercase tracking-[0.2em] text-ink-800 transition-colors hover:border-wine-700 hover:text-wine-700"
                >
                  {t("home.photosLink")}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Nous trouver                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-ink-900/10 bg-cream-100 py-28 sm:py-36">
        <div className="container grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <p className="kicker">{t("home.findUsTitle")}</p>
              <h2 className="mt-5 font-display text-3xl font-light text-ink-900">{siteName}</h2>
              <address className="mt-6 space-y-2 not-italic text-ink-700">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                  <span>
                    {settings.addressLine}
                    <br />
                    {settings.postalCode} {settings.city}
                  </span>
                </p>
                {settings.phone ? (
                  <p className="pl-7">
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-sweep text-wine-700">
                      {settings.phone}
                    </a>
                  </p>
                ) : null}
              </address>
              <div className="mt-8">
                <OpeningHours hours={hours} />
              </div>
              <div className="mt-10 flex gap-6 text-xs uppercase tracking-[0.15em]">
                <Link href="/contact" className="link-sweep text-wine-700">
                  {t("nav.contact")}
                </Link>
                <Link href="/reservation" className="link-sweep text-wine-700">
                  {t("home.bookTable")}
                </Link>
              </div>
            </div>
          </Reveal>
          {settings.mapEmbedUrl ? (
            <Reveal delay={120}>
              <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[360px]">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={siteName}
                  className="h-full min-h-[300px] w-full border-0"
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
