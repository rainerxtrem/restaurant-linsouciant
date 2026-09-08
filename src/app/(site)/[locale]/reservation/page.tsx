import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/services/settings.service";
import { ZenchefWidget } from "@/components/site/zenchef-widget";

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
  const settings = await getSiteSettings();

  return (
    <div className="bg-cream-50">
      <section className="border-b border-ink-900/10 bg-cream-100 py-20">
        <div className="container max-w-3xl">
          <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-ink-600">{t("intro")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          {settings.zenchefRestaurantId ? (
            <ZenchefWidget restaurantId={settings.zenchefRestaurantId} />
          ) : null}

          {settings.zenchefBookingUrl ? (
            <p className="mt-6 text-sm text-ink-600">
              {t("fallback")}{" "}
              <a
                href={settings.zenchefBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-sweep text-wine-700"
              >
                {t("openBooking")}
              </a>
            </p>
          ) : null}

          {settings.phone ? (
            <p className="mt-4 text-sm text-ink-500">
              {t("intro")} — <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-wine-700">{settings.phone}</a>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
