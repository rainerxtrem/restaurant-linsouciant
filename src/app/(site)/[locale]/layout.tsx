import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Fraunces, Inter } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteSettings, parseOpeningHours } from "@/lib/services/settings.service";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CookieConsentBanner } from "@/components/public/cookie-consent-banner";
import { AnalyticsLoader } from "@/components/public/analytics-loader";
import "../../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
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
  const settings = await getSiteSettings();
  const hours = parseOpeningHours(settings.openingHours);
  const loc = locale as "fr" | "en";
  const siteName = loc === "en" && settings.siteNameEn ? settings.siteNameEn : settings.siteName;
  const tagline = loc === "en" && settings.taglineEn ? settings.taglineEn : settings.tagline;

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader siteName={siteName} tagline={tagline} logoUrl={settings.logo?.url ?? null} />
            <main className="flex-1">{children}</main>
            <SiteFooter settings={settings} hours={hours} locale={loc} />
          </div>
          <CookieConsentBanner />
          <AnalyticsLoader />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
