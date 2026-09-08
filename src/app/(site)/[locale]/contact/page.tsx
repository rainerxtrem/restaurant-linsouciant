import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Car, Sparkles, CreditCard } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { getSiteSettings, parseOpeningHours } from "@/lib/services/settings.service";
import { OpeningHours } from "@/components/site/opening-hours";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: t("formIntro") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const settings = await getSiteSettings();
  const hours = parseOpeningHours(settings.openingHours);
  const tel = settings.phone.replace(/\s/g, "");

  const infoCards = [
    localized(settings, "parkingNote", locale)
      ? { icon: Car, title: t("contact.parking"), body: localized(settings, "parkingNote", locale) }
      : null,
    localized(settings, "servicesNote", locale)
      ? { icon: Sparkles, title: t("contact.services"), body: localized(settings, "servicesNote", locale) }
      : null,
    localized(settings, "paymentNote", locale)
      ? { icon: CreditCard, title: t("contact.payment"), body: localized(settings, "paymentNote", locale) }
      : null,
  ].filter((x): x is { icon: typeof Car; title: string; body: string } => x !== null);

  return (
    <div className="bg-cream-50">
      {/* En-tête */}
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-24">
        <div className="container max-w-3xl">
          <p className="eyebrow">{t("nav.contact")}</p>
          <h1 className="mt-4 font-display text-4xl text-ink-900 sm:text-5xl">{t("contact.title")}</h1>
        </div>
      </section>

      {/* Coordonnées + plan + horaires */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="flex h-full flex-col">
                <p className="eyebrow">{t("contact.howToCome")}</p>
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
                    Ouvrir dans Google Maps
                  </a>
                ) : null}

                <div className="mt-10 rounded-lg border border-ink-900/10 bg-white p-6">
                  <p className="eyebrow">{t("common.openingHours")}</p>
                  <div className="mt-4">
                    <OpeningHours hours={hours} />
                  </div>
                </div>
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
              <p className="eyebrow justify-center">{t("contact.formTitle")}</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-600">
                {t("contact.formIntro")}
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
