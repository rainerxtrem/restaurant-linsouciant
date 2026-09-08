import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { getNextAvailability } from "@/lib/zenchef";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservation" });
  return buildMetadata({ locale, path: "/reservation", title: t("title"), description: t("intro") });
}

export default async function ReservationPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reservation");
  const [settings, albums] = await Promise.all([getSiteSettings(), listAlbumsWithImages()]);
  const shot =
    settings.heroImage ??
    albums.find((a) => a.slug === "le-restaurant")?.images[0]?.media ??
    null;
  const tel = settings.phone.replace(/\s/g, "");
  const availability = settings.zenchefRestaurantId
    ? await getNextAvailability(settings.zenchefRestaurantId, 2)
    : null;
  const availabilityDate = availability
    ? new Date(availability.date + "T12:00:00").toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      <div className="relative hidden bg-ink-950 lg:block">
        {shot ? (
          <Image src={shot.url} alt="" fill className="object-cover opacity-80" sizes="50vw" />
        ) : null}
      </div>

      <div className="flex items-center justify-center bg-cream-50 px-6 py-24">
        <div className="w-full max-w-sm text-center">
          <Reveal>
            <p className="kicker">{t("title")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-light text-ink-900">{t("title")}</h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-600">{t("intro")}</p>
          </Reveal>

          {availability && availabilityDate ? (
            <Reveal delay={180}>
              <div className="mx-auto mt-9 max-w-xs border-t border-ink-900/10 pt-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
                  {locale === "en" ? "Next availability" : "Prochaines disponibilités"}
                </p>
                <p className="mt-1 font-display text-lg capitalize text-ink-800">{availabilityDate}</p>
                {availability.shifts.map((shift) => (
                  <div key={shift.name} className="mt-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold-600">{shift.name}</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {shift.slots.slice(0, 6).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          data-zc-action="open"
                          className="border border-ink-900/20 px-2.5 py-1 text-xs text-ink-700 transition-colors hover:border-wine-700 hover:text-wine-700"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={220}>
            <div className="mt-10 flex flex-col items-center gap-5">
              {settings.zenchefRestaurantId ? (
                <button
                  type="button"
                  data-zc-action="open"
                  className="w-full max-w-xs bg-wine-700 px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-wine-800"
                >
                  {t("openBooking")}
                </button>
              ) : null}

              {settings.zenchefBookingUrl ? (
                <a
                  href={settings.zenchefBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sweep text-xs uppercase tracking-[0.15em] text-ink-500"
                >
                  {t("fallback")}
                </a>
              ) : null}
            </div>
          </Reveal>

          {settings.phone ? (
            <Reveal delay={300}>
              <p className="mt-12 border-t border-ink-900/10 pt-8 text-sm text-ink-600">
                {locale === "en" ? "Groups & private events" : "Groupes & privatisations"}
                <br />
                <a href={`tel:${tel}`} className="mt-1 inline-block font-display text-xl text-wine-700">
                  {settings.phone}
                </a>
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
