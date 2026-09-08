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

const PEOPLE = {
  chef: {
    kicker: { fr: "En cuisine", en: "In the kitchen" },
    name: "Corentin Courtien",
    text: {
      fr: "Corentin Courtien compose une cuisine créative et instinctive, où les épices et les herbes tiennent le premier rôle. Près de 80 % des produits viennent de producteurs locaux, choisis en direct et au fil des saisons. Le midi, une bistronomie généreuse ; le soir, un menu dégustation plus ambitieux, ponctué de petits amuse-bouches entre les plats.",
      en: "Corentin Courtien creates a spontaneous, creative cuisine in which spices and herbs take the lead. Nearly 80% of the produce comes from local growers, chosen directly and with the seasons. At lunch, generous bistronomy; in the evening, a more ambitious tasting menu punctuated with small amuse-bouches between courses.",
    },
  },
  madeline: {
    kicker: { fr: "En salle", en: "In the dining room" },
    name: "Madeline Courtien",
    text: {
      fr: "Madeline Courtien orchestre un service précis et chaleureux, récompensé par le Trophée Gault&Millau du Jeune Talent Service en salle. Elle veille au rythme du repas, guide dans la carte des vins et compose les accords mets et vins qui prolongent chaque plat. Sa présence attentive, jamais pesante, fait de la salle un prolongement naturel de la cuisine — un lieu où l'on se sent reçu, pas simplement servi.",
      en: "Madeline Courtien leads a precise, warm service, honoured with the Gault&Millau Young Talent Award for front-of-house service. She keeps the rhythm of the meal, guides guests through the wine list and builds the pairings that carry each dish further. Her attentive, unobtrusive presence makes the dining room a natural extension of the kitchen — a place where you feel welcomed, not merely served.",
    },
  },
} as const;

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

  const [page, settings, albums] = await Promise.all([
    getPublishedPage("la-maison"),
    getSiteSettings(),
    listAlbumsWithImages(),
  ]);
  if (!page) notFound();

  const restaurant = albums.find((a) => a.slug === "le-restaurant");
  const chefImg =
    settings.aboutImage ?? restaurant?.images.find((i) => /dcc1a1/.test(i.media.filename))?.media ?? null;
  const madelineImg = restaurant?.images.find((i) => /68a950/.test(i.media.filename))?.media ?? null;
  const band = restaurant?.images[0]?.media ?? settings.heroImage ?? null;
  const introHtml = DOMPurify.sanitize(localized(page, "content", locale));

  const Person = ({
    data,
    image,
    reversed,
  }: {
    data: (typeof PEOPLE)[keyof typeof PEOPLE];
    image: { url: string } | null;
    reversed?: boolean;
  }) => (
    <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
      {image ? (
        <Reveal className={reversed ? "lg:order-2" : undefined}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Parallax amount={reversed ? -24 : 24} className="absolute -top-[8%] left-0 h-[116%] w-full">
              <Image src={image.url} alt={data.name} fill className="object-cover" sizes="50vw" />
            </Parallax>
          </div>
        </Reveal>
      ) : null}
      <Reveal delay={120} className={reversed ? "lg:order-1" : undefined}>
        <div className="max-w-md">
          <p className="kicker">{data.kicker[locale]}</p>
          <h2 className="mt-5 font-display text-3xl font-light tracking-tight text-ink-900 sm:text-4xl">
            {data.name}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink-600">{data.text[locale]}</p>
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
            {locale === "en" ? "The House" : "La Maison"}
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
        <Person data={PEOPLE.chef} image={chefImg} />
      </section>

      {/* Madeline */}
      <section className="border-t border-ink-900/10 bg-cream-100 py-24 sm:py-32">
        <Person data={PEOPLE.madeline} image={madelineImg} reversed />
      </section>
    </div>
  );
}
