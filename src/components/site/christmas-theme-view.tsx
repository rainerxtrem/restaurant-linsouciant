import Image from "next/image";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { Phone, Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n";
import { parseProductPrices } from "@/lib/validation/theme-page";
import { Reveal } from "@/components/public/reveal";
import { euro, Paragraphs, type ThemePageFull } from "@/components/site/theme-page-shared";

/**
 * Ambiance « Noël » d'une page thématique, inspirée du flyer des fêtes :
 * toile bordeaux, vert sapin, or, neige, texte circulaire autour du logo
 * et menu présenté comme une carte (badge rouge, choix séparés par « ou »).
 */

/** Flocons en CSS pur, positions déterministes (pas d'écart serveur/client). */
function Snowfall({ count = 46 }: { count?: number }) {
  return (
    <div aria-hidden className="noel-snow pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        const size = 2 + r(1) * 4;
        return (
          <span
            key={i}
            className="noel-flake"
            style={{
              left: `${r(2) * 100}%`,
              width: size,
              height: size,
              opacity: 0.35 + r(3) * 0.5,
              animationDuration: `${11 + r(4) * 14}s`,
              animationDelay: `${-r(5) * 25}s`,
              ["--drift" as string]: `${(r(6) - 0.5) * 120}px`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Branche de houx (deux feuilles, trois baies). */
function Holly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 44" aria-hidden className={className}>
      <path
        d="M58 24 C 46 8, 26 6, 8 14 C 18 16, 20 22, 17 28 C 25 26, 29 31, 28 38 C 38 30, 50 30, 58 24 Z"
        className="fill-[#2f5a3c]"
      />
      <path
        d="M62 24 C 74 8, 94 6, 112 14 C 102 16, 100 22, 103 28 C 95 26, 91 31, 92 38 C 82 30, 70 30, 62 24 Z"
        className="fill-[#3a6b48]"
      />
      <path d="M58 24 C 42 18, 28 16, 14 17 M62 24 C 78 18, 92 16, 106 17" className="fill-none stroke-[#1e3a27]" strokeWidth="0.8" />
      <circle cx="54" cy="22" r="5" className="fill-[#b3262e]" />
      <circle cx="66" cy="22" r="5" className="fill-[#a3202a]" />
      <circle cx="60" cy="14.5" r="5" className="fill-[#c22f36]" />
      <circle cx="58.6" cy="13" r="1.4" className="fill-white/50" />
      <circle cx="52.6" cy="20.5" r="1.2" className="fill-white/40" />
    </svg>
  );
}

/** Texte circulaire autour du logo, comme sur le flyer. */
function WishSeal({ text }: { text: string }) {
  const circumference = 2 * Math.PI * 118;
  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,400px)]">
      <svg viewBox="0 0 300 300" aria-hidden className="noel-spin absolute inset-0 h-full w-full">
        <defs>
          <path id="noel-circle" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
        </defs>
        <text className="fill-cream-50 font-sans text-[15px] uppercase" style={{ letterSpacing: "0.2em" }}>
          <textPath href="#noel-circle" textLength={circumference - 6} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] flex items-center justify-center">
        <Image src="/logo-light.png" alt="L'Insouciant" width={220} height={101} className="h-auto w-full" priority />
      </div>
    </div>
  );
}

export async function ChristmasThemeView({
  page,
  locale,
  phone,
  email,
}: {
  page: ThemePageFull;
  locale: Locale;
  phone: string | null;
  email: string | null;
}) {
  const t = await getTranslations("themePage");
  const title = localized(page, "title", locale);
  const intro = localized(page, "intro", locale);
  const orderInfo = localized(page, "orderInfo", locale);

  return (
    <div className="bg-noel-pine-dark text-cream-50">
      {/* Bandeau : toile bordeaux, neige, sceau circulaire */}
      <section className="noel-linen relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center lg:max-h-[1000px]">
        {page.heroImage ? (
          <Image
            src={page.heroImage.url}
            alt=""
            fill
            priority
            className="object-cover opacity-[0.12] mix-blend-luminosity"
            sizes="100vw"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(20,4,6,0.65)_100%)]" />
        <Snowfall />
        <div className="relative z-10">
          <Reveal>
            <WishSeal text={t("christmasWish")} />
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-10 font-display text-5xl font-light italic tracking-tight text-gold-200 sm:text-6xl">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={250}>
            <Holly className="mx-auto mt-6 w-24" />
          </Reveal>
        </div>
      </section>

      {/* Présentation */}
      {intro ? (
        <section className="relative bg-noel-pine-dark py-20">
          <Reveal className="container max-w-2xl space-y-5 text-center font-display text-xl font-light italic leading-relaxed text-cream-100/85 sm:text-2xl">
            <Paragraphs text={intro} />
          </Reveal>
        </section>
      ) : null}

      {/* Produits */}
      {page.products.length > 0 ? (
        <section className="noel-stars relative bg-noel-pine-dark pb-24 pt-4">
          <div className="container max-w-6xl">
            <div className="grid items-start gap-8 md:grid-cols-2">
              {page.products.map((product, i) => {
                const prices = parseProductPrices(product.prices);
                const name = localized(product, "name", locale);
                const description = localized(product, "description", locale);
                return (
                  <Reveal key={product.id} delay={(i % 2) * 100}>
                    <article className="rounded-[1.75rem] border border-gold-400/25 bg-noel-pine p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
                      <div className="flex flex-col overflow-hidden rounded-[1.4rem] border border-gold-400/15">
                        {product.image ? (
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={product.image.url}
                              alt={localized(product.image, "alt", locale) || name}
                              fill
                              className="object-cover"
                              sizes="(min-width: 768px) 560px, 100vw"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-1 flex-col px-7 py-9 text-center sm:px-9">
                          <span aria-hidden className="text-sm text-gold-400">✦</span>
                          <h2 className="mt-3 font-display text-2xl font-light tracking-tight text-gold-200 sm:text-[1.7rem]">
                            {name}
                          </h2>
                          {description ? (
                            <div className="mt-4 space-y-3 text-sm leading-relaxed text-cream-100/70">
                              <Paragraphs text={description} />
                            </div>
                          ) : null}
                          {prices.length > 0 ? (
                            <ul className="mx-auto w-full max-w-sm space-y-3 pt-7 text-left text-sm">
                              {prices.map((p, k) => {
                                const lbl = (locale === "en" && p.labelEn) || p.label;
                                return (
                                  <li key={k} className={`flex items-center gap-3 ${lbl ? "" : "justify-center"}`}>
                                    {lbl ? (
                                      <>
                                        <span className="text-cream-100/90">{lbl}</span>
                                        <span aria-hidden className="min-w-6 flex-1 border-b border-dotted border-gold-400/35" />
                                      </>
                                    ) : null}
                                    <span className="shrink-0 whitespace-nowrap rounded-full bg-noel-berry px-3.5 py-1 font-display text-base text-cream-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                                      {euro(p.priceCents)} €
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Menus, présentés comme sur le flyer */}
      {page.menus.map((menu) => {
        const formulas = menu.prices.filter((p) => p.kind === "FORMULA");
        const pairings = menu.prices.filter((p) => p.kind === "WINE_PAIRING");
        const main = formulas[0];
        const note = localized(menu, "availabilityNote", locale);
        const description = localized(menu, "description", locale);
        return (
          <section key={menu.id} id={`menu-${menu.slug}`} className="noel-linen relative overflow-hidden py-24">
            <Snowfall count={24} />
            <Reveal className="container relative z-10 max-w-3xl">
              <div className="relative rounded-[2.5rem] border border-gold-400/20 bg-noel-pine px-6 pb-14 pt-16 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] sm:px-14">
                <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4 whitespace-nowrap rounded-2xl bg-noel-berry px-5 py-3 shadow-lg sm:px-7">
                  <span className="font-sans text-sm uppercase tracking-[0.12em] text-cream-50 sm:text-lg">
                    {localized(menu, "name", locale)}
                  </span>
                  {main ? (
                    <span className="font-display text-xl text-cream-50 sm:text-2xl">{euro(main.priceCents)} €</span>
                  ) : null}
                </div>

                {note ? <p className="text-[11px] uppercase tracking-[0.3em] text-gold-300">{note}</p> : null}
                {main ? (
                  <p className="mt-2 text-sm text-cream-100/60">{localized(main, "label", locale)}</p>
                ) : null}
                {description ? <p className="mx-auto mt-4 max-w-lg text-sm text-cream-100/70">{description}</p> : null}

                <div className="mt-10">
                  {menu.sections.map((section, si) => (
                    <Fragment key={section.id}>
                      {si > 0 ? (
                        <span aria-hidden className="mx-auto my-10 block h-px w-2/5 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                      ) : null}
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-400/80">
                          {localized(section, "title", locale)}
                          {section.subtitle ? ` · ${localized(section, "subtitle", locale)}` : ""}
                        </p>
                        <div className="mt-5">
                          {section.dishes.map((dish, di) => (
                            <Fragment key={dish.id}>
                              {di > 0 ? (
                                <p className="my-3 font-display text-base italic text-gold-300/80">{t("or")}</p>
                              ) : null}
                              <h3 className="font-display text-xl font-medium text-cream-50 sm:text-2xl">
                                {localized(dish, "name", locale)}
                              </h3>
                              {dish.description ? (
                                <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-cream-100/70 sm:text-base">
                                  {localized(dish, "description", locale)}
                                </p>
                              ) : null}
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>

                {formulas.length > 1 || pairings.length > 0 ? (
                  <ul className="mx-auto mt-12 max-w-sm space-y-2 border-t border-gold-400/20 pt-8 text-left text-sm">
                    {[...formulas.slice(1), ...pairings].map((p) => (
                      <li key={p.id} className="flex items-baseline gap-3">
                        <span className="text-cream-100/85">{localized(p, "label", locale)}</span>
                        <span aria-hidden className="flex-1 border-b border-dotted border-gold-400/35" />
                        <span className="font-display text-gold-200">{euro(p.priceCents)} €</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          </section>
        );
      })}

      {/* Commander */}
      <section className="relative bg-noel-pine-dark py-24 text-center">
        <div className="container max-w-2xl">
          <Holly className="mx-auto w-20" />
          <div className="mt-8 rounded-[2rem] border-4 border-double border-gold-400/50 px-6 py-12 sm:px-12">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold-300">{t("orderKicker")}</p>
            <h2 className="mt-4 font-display text-3xl font-light italic text-gold-200 sm:text-4xl">
              {t("orderTitle")}
            </h2>
            {orderInfo ? (
              <div className="mt-7 space-y-4 text-base leading-relaxed text-cream-100/85">
                <Paragraphs text={orderInfo} />
              </div>
            ) : null}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center rounded-full bg-gold-400 px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] sm:px-7 sm:text-sm sm:tracking-[0.15em] text-noel-night transition-colors hover:bg-gold-300"
                >
                  <Phone className="mr-2 h-4 w-4" aria-hidden />
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(`${t("orderSubject")} — ${title}`)}`}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-gold-400/60 px-5 py-3 text-xs uppercase tracking-[0.12em] sm:px-7 sm:text-sm sm:tracking-[0.15em] text-gold-200 transition-colors hover:border-gold-300 hover:text-gold-100"
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  {t("orderByEmail")}
                </a>
              ) : (
                <Link href="/contact" className="text-sm uppercase tracking-[0.15em] text-gold-200 underline-offset-4 hover:underline">
                  {t("contactUs")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
