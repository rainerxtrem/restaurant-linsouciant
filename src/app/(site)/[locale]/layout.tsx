import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Fraunces, Inter } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { restaurantJsonLd } from "@/lib/seo";
import { getSiteSettings, parseOpeningHours } from "@/lib/services/settings.service";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CookieConsentBanner } from "@/components/public/cookie-consent-banner";
import { AnalyticsLoader } from "@/components/public/analytics-loader";
import { ZenchefLoader } from "@/components/site/zenchef-loader";
import { AnnouncementPopup } from "@/components/site/announcement-popup";
import { getActiveAnnouncement } from "@/lib/services/announcement.service";
import { listEnabledThemePages } from "@/lib/services/theme-page.service";
import { listDistinctions } from "@/lib/services/house.service";
import { localized } from "@/lib/i18n";
import DOMPurify from "isomorphic-dompurify";
import "../../globals.css";

// Polices variables (un seul fichier woff2 par style) — plus léger que des
// instances statiques multiples.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    robots: { index: true, follow: true },
  };
  try {
    const settings = await getSiteSettings();
    const iconUrl = settings.favicon?.url ?? settings.logo?.url;
    return {
      ...base,
      title: {
        default: settings.seoDefaultTitle || settings.siteName,
        template: `%s · ${settings.siteName}`,
      },
      description: settings.seoDefaultDescription || undefined,
      icons: iconUrl ? { icon: iconUrl, apple: iconUrl } : undefined,
    };
  } catch {
    return base;
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const [settings, announcement, themePages, distinctions] = await Promise.all([
    getSiteSettings(),
    getActiveAnnouncement(),
    listEnabledThemePages(),
    listDistinctions(),
  ]);
  const hours = parseOpeningHours(settings.openingHours);
  const loc = locale as "fr" | "en";
  const siteName = loc === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;
  const themeLinks = themePages.map((p) => ({
    href: `/${p.slug}`,
    label: (loc === "en" && (p.navLabelEn || p.titleEn)) || p.navLabel || p.title,
  }));

  const jsonLd = restaurantJsonLd({
    siteName,
    description: settings.seoDefaultDescription,
    addressLine: settings.addressLine,
    postalCode: settings.postalCode,
    city: settings.city,
    phone: settings.phone,
    email: settings.email,
    imageUrl: settings.ogImage?.url ?? settings.heroImage?.url ?? "/logo.png",
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    hours,
  });

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader
              siteName={siteName}
              logoUrl={settings.logo?.url ?? null}
              phone={settings.phone || null}
              email={settings.email || null}
              address={
                settings.addressLine
                  ? `${settings.addressLine}, ${settings.postalCode} ${settings.city}`
                  : null
              }
              facebookUrl={settings.facebookUrl}
              instagramUrl={settings.instagramUrl}
              giftVouchersEnabled={settings.giftVouchersEnabled}
              themeLinks={themeLinks}
            />
            <main className="flex-1">{children}</main>
            <SiteFooter settings={settings} hours={hours} locale={loc} themeLinks={themeLinks} distinctions={distinctions} />
          </div>
          <CookieConsentBanner />
          <AnalyticsLoader />
          {settings.zenchefRestaurantId ? (
            <ZenchefLoader restaurantId={settings.zenchefRestaurantId} />
          ) : null}
          {announcement ? (
            <AnnouncementPopup
              html={DOMPurify.sanitize(localized(announcement, "content", loc))}
              imageUrl={announcement.image?.url ?? null}
              buttonLabel={
                loc === "en"
                  ? announcement.buttonLabelEn || announcement.buttonLabel
                  : announcement.buttonLabel
              }
              buttonUrl={announcement.buttonUrl}
              dismissDays={announcement.dismissDays}
              signature={announcement.updatedAt.toISOString()}
            />
          ) : null}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
