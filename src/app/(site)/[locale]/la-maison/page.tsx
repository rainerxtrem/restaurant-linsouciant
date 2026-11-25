import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import DOMPurify from "isomorphic-dompurify";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/i18n";
import { getPublishedPage } from "@/lib/services/page.service";
import { getSiteSettings, isPageDisabled } from "@/lib/services/settings.service";
import { listAlbumsWithImages } from "@/lib/services/gallery.service";
import { listProducers } from "@/lib/services/house.service";
import { Reveal } from "@/components/public/reveal";
import { getPageContent } from "@/lib/content/page-content";
import { ProducersSection } from "@/components/site/producers-section";

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
    description: "Corentin Courtien & Madeline Courtien — le duo de L'Insouciant, au Mans.",
  });
}

export default async function LaMaisonPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await isPageDisabled("house")) notFound();

  const [page, settings, albums, producers] = await Promise.all([
    getPublishedPage("la-maison"),
    getSiteSettings(),
    listAlbumsWithImages(),
    listProducers(),
  ]);
  const c = await getPageContent("house", locale);
  if (!page) notFound();

  const restaurant = albums.find((a) => a.slug === "le-restaurant");
  const chefImg =
    c.image("chefPhoto") ??
    settings.aboutImage ?? restaurant?.images.find((i) => /dcc1a1/.test(i.media.filename))?.media ?? null;
  const madelineImg = c.image("madelinePhoto") ?? restaurant?.images.find((i) => /68a950/.test(i.media.filename))?.media ?? null;
  const band = c.image("bandImage") ?? restaurant?.images[0]?.media ?? settings.heroImage ?? null;
  const introHtml = DOMPurify.sanitize(localized(page, "content", locale));

  const Person = ({
    data,
    image,
    reversed,
  }: {
    data: { kicker: string; name: string; text: string };
    image: { url: string } | null;
    reversed?: boolean;
  }) => (
    <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
      {image ? (
        <Reveal kind="image" className={`relative aspect-[4/5] overflow-hidden ${reversed ? "lg:order-2" : ""}`}>
          <Image src={image.url} alt={data.name} fill className="object-cover" sizes="50vw" />
        </Reveal>
      ) : null}
      <Reveal delay={120} className={reversed ? "lg:order-1" : undefined}>
        <div className="max-w-md">
          <p className="kicker">{data.kicker}</p>
          <h2 className="mt-5 font-display text-3xl font-light tracking-tight text-ink-900 sm:text-4xl">
            {data.name}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink-600">{data.text}</p>
        </div>
      </Reveal>
    </div>
  );

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
            {c.text("kicker")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight sm:text-5xl">
            {localized(page, "title", locale)}
          </h1>
        </div>
      </section>

      {/* Intro éditable */}
      {introHtml.replace(/<[^>]*>/g, "").trim() ? (
        <section className="py-20 sm:py-28">
          <Reveal>
            <div
              className="prose prose-sm mx-auto max-w-2xl text-center text-ink-600 sm:prose-base"
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          </Reveal>
        </section>
      ) : null}

      {/* Corentin */}
      <section className="pb-24 sm:pb-32">
        <Person
          data={{ kicker: c.text("chefKicker"), name: c.text("chefName"), text: c.text("chefText") }}
          image={chefImg}
        />
      </section>

      {/* Madeline */}
      <section className="border-t border-ink-900/10 bg-cream-100 py-24 sm:py-32">
        <Person
          data={{ kicker: c.text("madelineKicker"), name: c.text("madelineName"), text: c.text("madelineText") }}
          image={madelineImg}
          reversed
        />
      </section>

      <ProducersSection
        producers={producers}
        locale={locale}
        kicker={c.text("producersKicker")}
        title={c.text("producersTitle")}
      />
    </div>
  );
}
