import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { listPublishedMenus } from "@/lib/services/menu.service";
import { MenuDisplay } from "@/components/site/menu-display";
import { Reveal } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menus" });
  return buildMetadata({ locale, path: "/menus", title: t("title"), description: t("intro") });
}

export default async function MenusPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menus");
  const menus = await listPublishedMenus();

  return (
    <div className="bg-cream-50">
      <section className="border-b border-ink-900/10 bg-cream-100 py-20">
        <div className="container max-w-3xl">
          <Reveal>
            <h1 className="font-display text-4xl text-ink-900 sm:text-5xl">{t("title")}</h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-4 text-ink-600">{t("intro")}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-3xl space-y-20">
          {menus.length === 0 ? (
            <p className="text-center text-sm text-ink-500">{t("empty")}</p>
          ) : (
            menus.map((menu) => (
              <Reveal key={menu.id}>
                <MenuDisplay menu={menu} locale={locale} />
              </Reveal>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
