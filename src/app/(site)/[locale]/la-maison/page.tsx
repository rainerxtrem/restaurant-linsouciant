import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import DOMPurify from "isomorphic-dompurify";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { getPublishedPage } from "@/lib/services/page.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { Reveal } from "@/components/public/reveal";
import { Parallax } from "@/components/site/parallax";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPublishedPage("la-maison");
  return buildMetadata({
    locale,
    path: "/la-maison",
    title: page ? localized(page, "title", locale) : "La Maison",
    description: "Corentin Courtien & Madeline Blais — le duo de L'Insouciant, au Mans.",
  });
}

export default async function LaMaisonPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, settings, albums] = await Promise.all([
    getPublishedPage("la-maison"),
    getSiteSettings(),
    listAlbumsWithImages(),
  ]);
  if (!page) notFound();

  const restaurant = albums.find((a) => a.slug === "le-restaurant");
  const chef = settings.aboutImage ?? restaurant?.images.find((i) => /dcc1a1/.test(i.media.filename))?.media ?? null;
  const madeline = restaurant?.images.find((i) => /68a950/.test(i.media.filename))?.media ?? null;
  const band = restaurant?.images[0]?.media ?? settings.heroImage ?? null;
  const html = DOMPurify.sanitize(localized(page, "content", locale));

  return (
    <div className="bg-cream-50">
      {/* Bandeau */}
      <section className="relative flex h-[46vh] min-h-[320px] items-end overflow-hidden bg-ink-950 text-cream-50">
        {band ? (
          <Image src={band.url} alt="" fill priority className="object-cover opacity-50" sizes="100vw" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-ink-950/20" />
        <div className="container relative z-10 max-w-3xl pb-12">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold-300">
            {locale === "en" ? "The House" : "La Maison"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            {localized(page, "title", locale)}
          </h1>
        </div>
      </section>

      {/* Chef + texte */}
      <section className="py-24 sm:py-32">
        <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {chef ? (
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Parallax amount={26} className="absolute -top-[8%] left-0 h-[116%] w-full">
                  <Image src={chef.url} alt="Corentin Courtien" fill className="object-cover" sizes="50vw" />
                </Parallax>
              </div>
            </Reveal>
          ) : null}
          <Reveal delay={120}>
            <div
              className="prose prose-sm max-w-none text-ink-600 sm:prose-base"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Reveal>
        </div>
      </section>

      {/* Madeline */}
      {madeline ? (
        <section className="border-t border-ink-900/10 bg-cream-100 py-24 sm:py-32">
          <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <Reveal className="lg:order-2">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Parallax amount={-26} className="absolute -top-[8%] left-0 h-[116%] w-full">
                  <Image src={madeline.url} alt="Madeline Blais" fill className="object-cover" sizes="50vw" />
                </Parallax>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:order-1">
              <div className="max-w-md">
                <p className="kicker">{locale === "en" ? "In the dining room" : "En salle"}</p>
                <h2 className="mt-5 font-display text-3xl font-light text-ink-900">Madeline Blais</h2>
                <p className="mt-5 text-sm leading-relaxed text-ink-600">
                  {locale === "en"
                    ? "Gault&Millau Young Talent Award — front-of-house service. A precise, attentive service that lets the cuisine speak."
                    : "Trophée Gault&Millau du Jeune Talent Service en salle. Un service précis et attentif, qui laisse la cuisine s'exprimer."}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}
    </div>
  );
}
