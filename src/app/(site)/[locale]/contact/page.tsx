import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail } from "lucide-react";
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

  const blocks: { title: string; body: string }[] = [];
  if (localized(settings, "parkingNote", locale))
    blocks.push({ title: t("contact.parking"), body: localized(settings, "parkingNote", locale) });
  if (localized(settings, "servicesNote", locale))
    blocks.push({ title: t("contact.services"), body: localized(settings, "servicesNote", locale) });
  if (localized(settings, "paymentNote", locale))
    blocks.push({ title: t("contact.payment"), body: localized(settings, "paymentNote", locale) });

  return (
    <div className="bg-cream-50">
      <section className="border-b border-ink-900/10 bg-cream-100 py-20">
        <div className="container max-w-3xl">
          <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t("contact.title")}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-8">
              <div>
                <p className="eyebrow">{t("contact.howToCome")}</p>
                <address className="mt-3 space-y-2 not-italic text-ink-700">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-gold-600" aria-hidden />
                    <span>
                      {settings.addressLine}
                      <br />
                      {settings.postalCode} {settings.city}
                    </span>
                  </p>
                  {settings.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gold-600" aria-hidden />
                      <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-sweep text-wine-700">
                        {settings.phone}
                      </a>
                    </p>
                  ) : null}
                  {settings.email ? (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gold-600" aria-hidden />
                      <a href={`mailto:${settings.email}`} className="link-sweep text-wine-700">
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
                    className="mt-3 inline-block text-sm text-wine-700 underline"
                  >
                    Google Maps
                  </a>
                ) : null}
              </div>

              <div>
                <p className="eyebrow">{t("common.openingHours")}</p>
                <div className="mt-3">
                  <OpeningHours hours={hours} />
                </div>
              </div>

              {blocks.map((b) => (
                <div key={b.title}>
                  <p className="eyebrow">{b.title}</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{b.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              {settings.mapEmbedUrl ? (
                <div className="mb-8 aspect-[4/3] overflow-hidden rounded-md shadow-card">
                  <iframe
                    src={settings.mapEmbedUrl}
                    title={settings.siteName}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
              <p className="eyebrow">{t("contact.formTitle")}</p>
              <p className="mt-2 mb-5 text-sm text-ink-600">{t("contact.formIntro")}</p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
