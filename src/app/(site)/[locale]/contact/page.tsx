import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GiftVoucherNote } from "@/components/site/gift-voucher-note";
import { MapPin, Phone, Mail, Car, Sparkles, CreditCard } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings, parseOpeningHours, isPageDisabled } from "@/lib/services/settings.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { OpeningHours } from "@/components/site/opening-hours";
import { ContactForm } from "@/components/site/contact-form";
import { getPageContent } from "@/lib/content/page-content";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = await getPageContent("contact", locale);
  return buildMetadata({ locale, path: "/contact", title: c.text("title"), description: c.text("formIntro") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await isPageDisabled("contact")) notFound();
  const [settings, albums, c] = await Promise.all([
    getSiteSettings(),
    listAlbumsWithImages(),
    getPageContent("contact", locale),
  ]);
  const hours = parseOpeningHours(settings.openingHours);
  const tel = settings.phone.replace(/\s/g, "");
  const headerImage =
    c.image("bandImage") ??
    settings.heroImage ??
    albums.find((a) => a.slug === "le-restaurant")?.images[0]?.media ??
    null;

  const infoCards = [
    c.text("parkingNote")
      ? { icon: Car, title: c.text("parkingTitle"), body: c.text("parkingNote") }
      : null,
    c.text("servicesNote")
      ? { icon: Sparkles, title: c.text("servicesTitle"), body: c.text("servicesNote") }
      : null,
    c.text("paymentNote")
      ? { icon: CreditCard, title: c.text("paymentTitle"), body: c.text("paymentNote") }
      : null,
  ].filter((x): x is { icon: typeof Car; title: string; body: string } => x !== null);

  return (
    <div className="bg-cream-50">
      {/* En-tête avec image */}
      <section className="relative flex h-[42vh] min-h-[300px] items-end overflow-hidden bg-ink-950 text-cream-50">
        {headerImage ? (
          <Image
            src={headerImage.url}
            alt=""
            fill
            priority
            className="object-cover opacity-55"
            sizes="100vw"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-ink-950/20" />
        <div className="container relative z-10 max-w-3xl pb-12">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold-300">{c.text("kicker")}</p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            {c.text("title")}
          </h1>
        </div>
      </section>

      {/* Coordonnées + plan + horaires */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="flex h-full flex-col">
                <p className="eyebrow">{c.text("howToCome")}</p>
                <address className="mt-5 space-y-4 not-italic">
                  <p className="flex items-start gap-3 text-ink-800">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden />
                    <span className="text-base leading-relaxed">
                      {settings.addressLine}
                      <br />
                      {settings.postalCode} {settings.city}
                    </span>
                  </p>
                  {settings.phone ? (
                    <p className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
                      <a href={`tel:${tel}`} className="link-sweep text-base text-wine-700">
                        {settings.phone}
                      </a>
                    </p>
                  ) : null}
                  {settings.email ? (
                    <p className="flex items-center gap-3">
                      <Mail className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
                      <a href={`mailto:${settings.email}`} className="link-sweep text-base text-wine-700">
                        {settings.email}
                      </a>
                    </p>
                  ) : null}
                </address>
                {settings.googleMapsUrl ? (
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-sm border border-ink-900/15 px-4 py-2 text-sm text-ink-800 transition-colors hover:border-wine-600 hover:text-wine-700"
                  >
                    {c.text("mapsLink")}
                  </a>
                ) : null}

                <div className="mt-10 rounded-lg border border-ink-900/10 bg-white p-6">
                  <p className="eyebrow">{c.text("hoursTitle")}</p>
                  <div className="mt-4">
                    <OpeningHours hours={hours} />
                  </div>
                </div>

                <GiftVoucherNote className="mt-6" />
              </div>
            </Reveal>

            <Reveal delay={120}>
              {settings.mapEmbedUrl ? (
                <div className="h-full min-h-[360px] overflow-hidden rounded-lg shadow-card">
                  <iframe
                    src={settings.mapEmbedUrl}
                    title={settings.siteName}
                    className="h-full min-h-[360px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Infos pratiques — cartes séparées */}
      {infoCards.length > 0 ? (
        <section className="border-t border-ink-900/10 bg-cream-100 py-16">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Reveal key={card.title}>
                    <div className="h-full rounded-lg border border-ink-900/10 bg-white p-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-gold-600">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="mt-4 font-display text-lg text-ink-900">{card.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{card.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Formulaire */}
      <section className="border-t border-ink-900/10 py-16 sm:py-20">
        <div className="container max-w-2xl">
          <Reveal>
            <div className="text-center">
              <p className="eyebrow justify-center">{c.text("formTitle")}</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-600">
                {c.text("formIntro")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 rounded-lg border border-ink-900/10 bg-white p-6 shadow-card sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
