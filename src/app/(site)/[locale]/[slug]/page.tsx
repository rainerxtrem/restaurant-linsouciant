import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import DOMPurify from "isomorphic-dompurify";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { getPublishedPage } from "@/lib/services/page.service";
import { getEnabledThemePageBySlug } from "@/lib/services/theme-page.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { ThemePageView } from "@/components/site/theme-page-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) {
    const theme = await getEnabledThemePageBySlug(slug);
    if (!theme) return {};
    return buildMetadata({
      locale,
      path: `/${slug}`,
      title: localized(theme, "title", locale),
      description: localized(theme, "intro", locale).slice(0, 160) || null,
      image: theme.heroImage?.url ?? null,
    });
  }
  return buildMetadata({
    locale,
    path: `/${slug}`,
    title: page.seoTitle || localized(page, "title", locale),
    description: page.seoDescription,
  });
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPublishedPage(slug);
  if (!page) {
    // Pas une page de contenu : peut-être une page thématique (Noël…).
    const theme = await getEnabledThemePageBySlug(slug);
    if (!theme) notFound();
    const settings = await getSiteSettings();
    return (
      <ThemePageView
        page={theme}
        locale={locale}
        siteName={(locale === "en" && settings.siteNameEn) || settings.siteName}
        phone={settings.phone || null}
        email={settings.email || null}
      />
    );
  }

  const html = DOMPurify.sanitize(localized(page, "content", locale));

  return (
    <div className="bg-cream-50 py-20">
      <article className="container max-w-3xl">
        <h1 className="font-display text-4xl text-ink-900">{localized(page, "title", locale)}</h1>
        <div
          className="prose prose-sm mt-8 max-w-none sm:prose-base"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
