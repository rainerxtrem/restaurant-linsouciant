import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { listPublishedMenus } from "@/lib/services/menu.service";
import { GiftVoucherForm, type MenuOffer } from "@/components/site/gift-voucher-form";
import { Reveal } from "@/components/public/reveal";
import { getPageContent } from "@/lib/content/page-content";
import { getSiteSettings } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = await getPageContent("giftVouchers", locale);
  return buildMetadata({ locale, path: "/bons-cadeaux", title: c.text("title"), description: c.text("intro") });
}

export default async function GiftVouchersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getSiteSettings()).giftVouchersEnabled) notFound();
  const [albums, menus, c] = await Promise.all([
    listAlbumsWithImages(),
    listPublishedMenus(),
    getPageContent("giftVouchers", locale),
  ]);
  const shot =
    c.image("sideImage") ??
    albums.find((a) => a.slug === "les-plats")?.images[2]?.media ??
    albums.flatMap((a) => a.images)[0]?.media ??
    null;

  const offers: MenuOffer[] = menus
    .map((m) => ({
      menuName: m.name,
      menuNameEn: m.nameEn,
      options: m.prices
        .filter((p) => p.kind === "FORMULA")
        .map((p) => ({ id: p.id, label: p.label, labelEn: p.labelEn, priceCents: p.priceCents })),
    }))
    .filter((o) => o.options.length > 0);

  return (
    <div className="lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-ink-950 lg:block">
        {shot ? <Image src={shot.url} alt="" fill className="object-cover opacity-85" sizes="50vw" /> : null}
        <div className="absolute inset-0 flex items-end p-12">
          <p className="max-w-xs font-display text-2xl font-light italic text-cream-50/90">
            {c.text("intro")}
          </p>
        </div>
      </div>

      <div className="bg-cream-50 px-6 py-24 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-lg">
          <Reveal>
            <p className="kicker">{c.text("title")}</p>
            <h1 className="mt-5 font-display text-4xl font-light text-ink-900">
              {c.text("title")}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-ink-600 lg:hidden">
              {c.text("intro")}
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12">
              <GiftVoucherForm offers={offers} locale={locale} />
            </div>
          </Reveal>

          <p className="mt-10 border-l border-gold-500/50 pl-4 text-xs leading-relaxed text-ink-600">
            {c.text("bookingNote")}
          </p>

          <p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-ink-400">
            <Link href="/cgv" className="link-sweep">
              {c.text("termsLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
