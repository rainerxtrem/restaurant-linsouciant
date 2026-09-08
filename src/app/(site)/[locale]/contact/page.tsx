import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

  const notes = [
    localized(settings, "parkingNote", locale)
      ? { title: t("contact.parking"), body: localized(settings, "parkingNote", locale) }
      : null,
    localized(settings, "servicesNote", locale)
      ? { title: t("contact.services"), body: localized(settings, "servicesNote", locale) }
      : null,
    localized(settings, "paymentNote", locale)
      ? { title: t("contact.payment"), body: localized(settings, "paymentNote", locale) }
      : null,
  ].filter((x): x is { title: string; body: string } => x !== null);

  return (
    <div className="bg-cream-50">
      {/* En-tête minimal */}
      <section className="py-28 text-center sm:py-36">
        <div className="container max-w-xl">
          <Reveal>
            <p className="kicker">{t("nav.contact")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-ink-900 sm:text-5xl">
              {t("contact.title")}
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Coordonnées + plan */}
      <section>
        <div className="grid lg:grid-cols-2">
          <Reveal>
            <div className="flex items-center px-6 py-10 sm:px-12 lg:py-20">
              <div className="mx-auto w-full max-w-sm">
                <p className="kicker">{t("contact.howToCome")}</p>
                <address className="mt-6 not-italic">
                  <p className="font-display text-2xl font-light leading-snug text-ink-900">
                    {settings.addressLine}
                    <br />
                    {settings.postalCode} {settings.city}
                  </p>
                  <div className="mt-6 flex flex-col gap-1.5 text-sm">
                    {settings.phone ? (
                      <a href={`tel:${tel}`} className="link-sweep w-fit text-wine-700">
                        {settings.phone}
                      </a>
                    ) : null}
                    {settings.email ? (
                      <a href={`mailto:${settings.email}`} className="link-sweep w-fit text-wine-700">
                        {settings.email}
                      </a>
                    ) : null}
                    {settings.googleMapsUrl ? (
                      <a
                        href={settings.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-sweep mt-2 w-fit text-[11px] uppercase tracking-[0.15em] text-ink-500"
                      >
                        Google Maps
                      </a>
                    ) : null}
                  </div>
                </address>

                <div className="mt-10 border-t border-ink-900/10 pt-8">
                  <p className="kicker">{t("common.openingHours")}</p>
                  <div className="mt-5 text-ink-800">
                    <OpeningHours hours={hours} />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {settings.mapEmbedUrl ? (
              <div className="min-h-[380px] lg:h-full">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={settings.siteName}
                  className="h-full min-h-[380px] w-full border-0 grayscale-[35%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* Infos pratiques — liste filaire */}
      {notes.length > 0 ? (
        <section className="border-y border-ink-900/10 bg-cream-100 py-16 sm:py-20">
          <div className="container max-w-3xl divide-y divide-ink-900/10">
            {notes.map((note) => (
              <Reveal key={note.title}>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold-600">{note.title}</p>
                  <p className="text-sm leading-relaxed text-ink-700">{note.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Formulaire */}
      <section className="py-24 sm:py-32">
        <div className="container max-w-xl">
          <Reveal>
            <div className="text-center">
              <p className="kicker">{t("contact.formTitle")}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-600">
                {t("contact.formIntro")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-12">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
