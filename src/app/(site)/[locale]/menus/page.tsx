import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { listPublishedMenus } from "@/lib/services/menu.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
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
  const [menus, albums] = await Promise.all([listPublishedMenus(), listAlbumsWithImages()]);
  const backdrop = albums.find((a) => a.slug === "les-plats")?.images[0]?.media ?? null;

  return (
    <div>
      {/* Intro plein cadre */}
      <section className="relative flex h-[70svh] min-h-[420px] items-center justify-center overflow-hidden bg-ink-950 text-cream-50">
        {backdrop ? (
          <Image src={backdrop.url} alt="" fill priority className="object-cover opacity-40" sizes="100vw" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/30 to-ink-950/80" />
        <div className="relative z-10 px-6 text-center">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold-300">{t("nav.menus")}</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 font-display text-5xl font-light tracking-tight sm:text-6xl">
              {t("menus.title")}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <span className="mx-auto mt-7 block h-px w-14 bg-gold-400/70" />
          </Reveal>
          <Reveal delay={220}>
            <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-cream-100/70">
              {t("menus.intro")}
            </p>
          </Reveal>
        </div>
      </section>

      {menus.length === 0 ? (
        <p className="bg-cream-50 py-32 text-center text-sm text-ink-500">{t("menus.empty")}</p>
      ) : (
        menus.map((menu, i) => (
          <MenuDisplay key={menu.id} menu={menu} locale={locale} index={i} />
        ))
      )}

      <section className="border-t border-ink-900/10 bg-cream-100 py-20 text-center">
        <Link
          href="/reservation"
          className="inline-block border-b border-ink-900/30 pb-1 text-xs uppercase tracking-[0.2em] text-ink-800 transition-colors hover:border-wine-700 hover:text-wine-700"
        >
          {t("home.bookTable")}
        </Link>
      </section>
    </div>
  );
}
