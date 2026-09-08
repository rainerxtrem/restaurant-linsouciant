import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";
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
  const t = await getTranslations();
  const menus = await listPublishedMenus();

  return (
    <div className="bg-cream-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 py-24 text-center text-cream-50 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="container relative max-w-2xl">
          <Reveal>
            <p className="eyebrow justify-center text-gold-300 before:bg-gold-300">
              {t("nav.menus")}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-light tracking-tight sm:text-5xl">
              {t("menus.title")}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream-100/70">
              {t("menus.intro")}
            </p>
          </Reveal>

          {menus.length > 1 ? (
            <Reveal delay={200}>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                {menus.map((menu) => (
                  <Link
                    key={menu.id}
                    href={{ pathname: "/menus", hash: `menu-${menu.slug}` }}
                    className="rounded-full border border-cream-100/25 px-4 py-1.5 text-xs uppercase tracking-wide text-cream-100/80 transition-colors hover:border-gold-400 hover:text-gold-300"
                  >
                    {localized(menu, "name", locale)}
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Menus */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-3xl space-y-14">
          {menus.length === 0 ? (
            <p className="text-center text-sm text-ink-500">{t("menus.empty")}</p>
          ) : (
            menus.map((menu) => (
              <Reveal key={menu.id}>
                <MenuDisplay menu={menu} locale={locale} />
              </Reveal>
            ))
          )}
        </div>

        <div className="container mt-16 max-w-3xl text-center">
          <Link href="/reservation" className="btn-cta">
            {t("home.bookTable")}
          </Link>
        </div>
      </section>
    </div>
  );
}
