import Image from "next/image";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { CalendarDays, Phone, Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n";
import { parseProductPrices, type ThemePageStyle } from "@/lib/validation/theme-page";
import { Reveal } from "@/components/public/reveal";
import { euro, Paragraphs, type ThemePageFull } from "@/components/site/theme-page-shared";

/**
 * Ambiances « fêtes » des pages thématiques (Noël, Pâques, Saint-Valentin).
 * Même structure pour toutes — bandeau avec texte circulaire autour du logo,
 * présentation, cartes produits, menu présenté comme une carte (badge
 * centré, choix séparés par « ou »), bloc commande — habillée par un jeu de
 * classes, un ornement et des particules propres à chaque fête.
 */

type FestiveStyle = Exclude<ThemePageStyle, "classic">;
type Particle = "snow" | "petals" | "hearts";

interface Festive {
  wishKey: "christmasWish" | "easterWish" | "valentineWish";
  ctaTitleKey: "orderTitle" | "bookTitle";
  showReserve: boolean;
  particles: Particle;
  logo: string;
  Ornament: (props: { className?: string }) => React.JSX.Element;
  c: {
    root: string;
    hero: string;
    heroImage: string;
    vignette: string;
    seal: string;
    title: string;
    intro: string;
    products: string;
    card: string;
    cardInner: string;
    star: string;
    name: string;
    desc: string;
    label: string;
    leader: string;
    pill: string;
    menuSection: string;
    menuCard: string;
    badge: string;
    note: string;
    sub: string;
    divider: string;
    kicker: string;
    or: string;
    dish: string;
    dishDesc: string;
    extraBorder: string;
    extraPrice: string;
    order: string;
    orderBox: string;
    orderKicker: string;
    orderTitle: string;
    orderText: string;
    btnPrimary: string;
    btnSecondary: string;
  };
}

/* ----------------------------------------------------------------- Ornements */

function Holly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 44" aria-hidden className={className}>
      <path d="M58 24 C 46 8, 26 6, 8 14 C 18 16, 20 22, 17 28 C 25 26, 29 31, 28 38 C 38 30, 50 30, 58 24 Z" className="fill-[#2f5a3c]" />
      <path d="M62 24 C 74 8, 94 6, 112 14 C 102 16, 100 22, 103 28 C 95 26, 91 31, 92 38 C 82 30, 70 30, 62 24 Z" className="fill-[#3a6b48]" />
      <path d="M58 24 C 42 18, 28 16, 14 17 M62 24 C 78 18, 92 16, 106 17" className="fill-none stroke-[#1e3a27]" strokeWidth="0.8" />
      <circle cx="54" cy="22" r="5" className="fill-[#b3262e]" />
      <circle cx="66" cy="22" r="5" className="fill-[#a3202a]" />
      <circle cx="60" cy="14.5" r="5" className="fill-[#c22f36]" />
      <circle cx="58.6" cy="13" r="1.4" className="fill-white/50" />
      <circle cx="52.6" cy="20.5" r="1.2" className="fill-white/40" />
    </svg>
  );
}

/** Œuf décoré posé sur deux feuilles. */
function EasterEgg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" aria-hidden className={className}>
      <path d="M60 52 C 44 50, 28 44, 14 34 C 30 32, 46 38, 60 52 Z" className="fill-[#8fae6b]" />
      <path d="M60 52 C 76 50, 92 44, 106 34 C 90 32, 74 38, 60 52 Z" className="fill-[#a4c07f]" />
      <defs>
        <clipPath id="egg-clip">
          <path d="M60 4 C 74 4, 82 24, 82 36 C 82 48, 72 54, 60 54 C 48 54, 38 48, 38 36 C 38 24, 46 4, 60 4 Z" />
        </clipPath>
      </defs>
      <path d="M60 4 C 74 4, 82 24, 82 36 C 82 48, 72 54, 60 54 C 48 54, 38 48, 38 36 C 38 24, 46 4, 60 4 Z" className="fill-[#f6e7b0]" />
      <g clipPath="url(#egg-clip)">
        <path d="M36 24 Q 48 18 60 24 T 84 24" className="fill-none stroke-[#e2a3a8]" strokeWidth="3" />
        <path d="M36 34 Q 48 28 60 34 T 84 34" className="fill-none stroke-[#8fae6b]" strokeWidth="3" />
        <path d="M36 44 Q 48 38 60 44 T 84 44" className="fill-none stroke-[#e9b949]" strokeWidth="3" />
      </g>
      <ellipse cx="53" cy="16" rx="3" ry="5" className="fill-white/60" />
    </svg>
  );
}

/** Deux cœurs entrelacés. */
function Hearts({ className }: { className?: string }) {
  const heart = "M0 -6 C -4 -14, -16 -12, -16 -2 C -16 6, -6 12, 0 18 C 6 12, 16 6, 16 -2 C 16 -12, 4 -14, 0 -6 Z";
  return (
    <svg viewBox="0 0 120 48" aria-hidden className={className}>
      <path d={heart} transform="translate(50 20) rotate(-12)" className="fill-[#c0254f]" />
      <path d={heart} transform="translate(70 22) rotate(12)" className="fill-none stroke-[#f1c4b5]" strokeWidth="2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- Ambiances */

const FESTIVE: Record<FestiveStyle, Festive> = {
  christmas: {
    wishKey: "christmasWish",
    ctaTitleKey: "orderTitle",
    showReserve: false,
    particles: "snow",
    logo: "/logo-light.png",
    Ornament: Holly,
    c: {
      root: "bg-noel-pine-dark text-cream-50",
      hero: "noel-linen",
      heroImage: "opacity-[0.12] mix-blend-luminosity",
      vignette: "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(20,4,6,0.65)_100%)]",
      seal: "fill-cream-50",
      title: "text-gold-200",
      intro: "bg-noel-pine-dark text-cream-100/85",
      products: "noel-stars bg-noel-pine-dark",
      card: "border-gold-400/25 bg-noel-pine shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]",
      cardInner: "border-gold-400/15",
      star: "text-gold-400",
      name: "text-gold-200",
      desc: "text-cream-100/70",
      label: "text-cream-100/90",
      leader: "border-gold-400/35",
      pill: "bg-noel-berry text-cream-50",
      menuSection: "noel-linen",
      menuCard: "border-gold-400/20 bg-noel-pine shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]",
      badge: "bg-noel-berry text-cream-50",
      note: "text-gold-300",
      sub: "text-cream-100/60",
      divider: "via-gold-500",
      kicker: "text-gold-400/80",
      or: "text-gold-300/80",
      dish: "text-cream-50",
      dishDesc: "text-cream-100/70",
      extraBorder: "border-gold-400/20",
      extraPrice: "text-gold-200",
      order: "bg-noel-pine-dark",
      orderBox: "border-gold-400/50",
      orderKicker: "text-gold-300",
      orderTitle: "text-gold-200",
      orderText: "text-cream-100/85",
      btnPrimary: "bg-gold-400 text-noel-night hover:bg-gold-300",
      btnSecondary: "border-gold-400/60 text-gold-200 hover:border-gold-300 hover:text-gold-100",
    },
  },

  easter: {
    wishKey: "easterWish",
    ctaTitleKey: "orderTitle",
    showReserve: false,
    particles: "petals",
    logo: "/logo.png",
    Ornament: EasterEgg,
    c: {
      root: "bg-[#f7f3e8] text-ink-800",
      hero: "fest-spring",
      heroImage: "opacity-[0.07] mix-blend-multiply",
      vignette: "bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(143,174,107,0.18)_100%)]",
      seal: "fill-[#4d6b3a]",
      title: "text-[#4d6b3a]",
      intro: "bg-[#f7f3e8] text-ink-600",
      products: "fest-dots bg-[#f7f3e8]",
      card: "border-[#8fae6b]/40 bg-white shadow-[0_30px_60px_-34px_rgba(77,107,58,0.35)]",
      cardInner: "border-[#8fae6b]/20",
      star: "text-[#e9b949]",
      name: "text-[#3f5a30]",
      desc: "text-ink-500",
      label: "text-ink-700",
      leader: "border-[#8fae6b]/45",
      pill: "bg-[#e9b949] text-ink-900",
      menuSection: "fest-spring",
      menuCard: "border-[#8fae6b]/30 bg-white shadow-[0_40px_80px_-40px_rgba(77,107,58,0.45)]",
      badge: "bg-[#6f8f52] text-white",
      note: "text-[#6f8f52]",
      sub: "text-ink-500",
      divider: "via-[#e9b949]",
      kicker: "text-[#6f8f52]",
      or: "text-[#c98a8f]",
      dish: "text-ink-900",
      dishDesc: "text-ink-500",
      extraBorder: "border-[#8fae6b]/30",
      extraPrice: "text-[#4d6b3a]",
      order: "bg-[#eef2e4]",
      orderBox: "border-[#8fae6b]/60",
      orderKicker: "text-[#6f8f52]",
      orderTitle: "text-[#3f5a30]",
      orderText: "text-ink-700",
      btnPrimary: "bg-[#6f8f52] text-white hover:bg-[#5d7a43]",
      btnSecondary: "border-[#6f8f52]/60 text-[#4d6b3a] hover:border-[#4d6b3a]",
    },
  },

  valentine: {
    wishKey: "valentineWish",
    ctaTitleKey: "bookTitle",
    showReserve: true,
    particles: "hearts",
    logo: "/logo-light.png",
    Ornament: Hearts,
    c: {
      root: "bg-[#1d0910] text-cream-50",
      hero: "fest-velvet",
      heroImage: "opacity-[0.14] mix-blend-luminosity",
      vignette: "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(18,3,8,0.7)_100%)]",
      seal: "fill-[#f6d9cf]",
      title: "text-[#f3cbbd]",
      intro: "bg-[#1d0910] text-cream-100/85",
      products: "fest-glow bg-[#1d0910]",
      card: "border-[#f1c4b5]/25 bg-[#2a0e18] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]",
      cardInner: "border-[#f1c4b5]/15",
      star: "text-[#e46a8b]",
      name: "text-[#f3cbbd]",
      desc: "text-cream-100/70",
      label: "text-cream-100/90",
      leader: "border-[#f1c4b5]/30",
      pill: "bg-[#c0254f] text-cream-50",
      menuSection: "fest-velvet",
      menuCard: "border-[#f1c4b5]/20 bg-[#2a0e18] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)]",
      badge: "bg-[#c0254f] text-cream-50",
      note: "text-[#f1c4b5]",
      sub: "text-cream-100/60",
      divider: "via-[#e46a8b]",
      kicker: "text-[#f1c4b5]/80",
      or: "text-[#e46a8b]",
      dish: "text-cream-50",
      dishDesc: "text-cream-100/70",
      extraBorder: "border-[#f1c4b5]/20",
      extraPrice: "text-[#f3cbbd]",
      order: "bg-[#1d0910]",
      orderBox: "border-[#f1c4b5]/45",
      orderKicker: "text-[#f1c4b5]",
      orderTitle: "text-[#f3cbbd]",
      orderText: "text-cream-100/85",
      btnPrimary: "bg-[#c0254f] text-cream-50 hover:bg-[#d62f5c]",
      btnSecondary: "border-[#f1c4b5]/55 text-[#f3cbbd] hover:border-[#f3cbbd] hover:text-cream-50",
    },
  },
};

/* --------------------------------------------------------------- Particules */

/** Particules en CSS pur, positions déterministes (pas d'écart serveur/client). */
function Particles({ kind, count = 46 }: { kind: Particle; count?: number }) {
  return (
    <div aria-hidden className="fest-particles pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        const common = {
          left: `${r(2) * 100}%`,
          animationDuration: `${(kind === "hearts" ? 14 : 11) + r(4) * 14}s`,
          animationDelay: `${-r(5) * 25}s`,
          ["--drift" as string]: `${(r(6) - 0.5) * 120}px`,
        };
        if (kind === "snow") {
          const size = 2 + r(1) * 4;
          return <span key={i} className="noel-flake" style={{ ...common, width: size, height: size, opacity: 0.35 + r(3) * 0.5 }} />;
        }
        if (kind === "petals") {
          const size = 6 + r(1) * 7;
          const colors = ["#f3c6cc", "#f6e2a1", "#ffffff", "#d9e6c3"];
          return (
            <span
              key={i}
              className="fest-petal"
              style={{ ...common, width: size, height: size * 0.7, background: colors[i % colors.length], opacity: 0.55 + r(3) * 0.4 }}
            />
          );
        }
        return (
          <span
            key={i}
            className="fest-heart"
            style={{ ...common, fontSize: 8 + r(1) * 12, opacity: 0.25 + r(3) * 0.45, color: i % 3 ? "#e46a8b" : "#f1c4b5" }}
          >
            ♥
          </span>
        );
      })}
    </div>
  );
}

/** Texte circulaire autour du logo. */
function WishSeal({ text, className, logo }: { text: string; className: string; logo: string }) {
  const circumference = 2 * Math.PI * 118;
  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,400px)]">
      <svg viewBox="0 0 300 300" aria-hidden className="noel-spin absolute inset-0 h-full w-full">
        <defs>
          <path id="fest-circle" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
        </defs>
        <text className={`${className} font-sans text-[15px] uppercase`} style={{ letterSpacing: "0.2em" }}>
          <textPath href="#fest-circle" textLength={circumference - 6} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] flex items-center justify-center">
        <Image src={logo} alt="L'Insouciant" width={220} height={101} className="h-auto w-full" priority />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- Vue */

export async function FestiveThemeView({
  page,
  style,
  locale,
  phone,
  email,
}: {
  page: ThemePageFull;
  style: FestiveStyle;
  locale: Locale;
  phone: string | null;
  email: string | null;
}) {
  const t = await getTranslations("themePage");
  const f = FESTIVE[style];
  const { c, Ornament } = f;
  const title = localized(page, "title", locale);
  const intro = localized(page, "intro", locale);
  const orderInfo = localized(page, "orderInfo", locale);
  const btn = "inline-flex items-center whitespace-nowrap rounded-full px-5 py-3 text-xs uppercase tracking-[0.12em] transition-colors sm:px-7 sm:text-sm sm:tracking-[0.15em]";

  return (
    <div className={c.root}>
      {/* Bandeau */}
      <section className={`${c.hero} relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center lg:max-h-[1000px]`}>
        {page.heroImage ? (
          <Image src={page.heroImage.url} alt="" fill priority className={`object-cover ${c.heroImage}`} sizes="100vw" />
        ) : null}
        <div className={`pointer-events-none absolute inset-0 ${c.vignette}`} />
        <Particles kind={f.particles} />
        <div className="relative z-10">
          <Reveal>
            <WishSeal text={t(f.wishKey)} className={c.seal} logo={f.logo} />
          </Reveal>
          <Reveal delay={150}>
            <h1 className={`mt-10 font-display text-5xl font-light italic tracking-tight sm:text-6xl ${c.title}`}>{title}</h1>
          </Reveal>
          <Reveal delay={250}>
            <Ornament className="mx-auto mt-6 w-24" />
          </Reveal>
        </div>
      </section>

      {/* Présentation */}
      {intro ? (
        <section className={`relative py-20 ${c.intro}`}>
          <Reveal className="container max-w-2xl space-y-5 text-center font-display text-xl font-light italic leading-relaxed sm:text-2xl">
            <Paragraphs text={intro} />
          </Reveal>
        </section>
      ) : null}

      {/* Produits */}
      {page.products.length > 0 ? (
        <section className={`relative pb-24 pt-4 ${c.products}`}>
          <div className="container max-w-6xl">
            <div className="grid items-start gap-8 md:grid-cols-2">
              {page.products.map((product, i) => {
                const prices = parseProductPrices(product.prices);
                const name = localized(product, "name", locale);
                const description = localized(product, "description", locale);
                return (
                  <Reveal key={product.id} delay={(i % 2) * 100}>
                    <article className={`rounded-[1.75rem] border p-2 ${c.card}`}>
                      <div className={`flex flex-col overflow-hidden rounded-[1.4rem] border ${c.cardInner}`}>
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
                          <span aria-hidden className={`text-sm ${c.star}`}>✦</span>
                          <h2 className={`mt-3 font-display text-2xl font-light tracking-tight sm:text-[1.7rem] ${c.name}`}>{name}</h2>
                          {description ? (
                            <div className={`mt-4 space-y-3 text-sm leading-relaxed ${c.desc}`}>
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
                                        <span className={c.label}>{lbl}</span>
                                        <span aria-hidden className={`min-w-6 flex-1 border-b border-dotted ${c.leader}`} />
                                      </>
                                    ) : null}
                                    <span
                                      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 font-display text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${c.pill}`}
                                    >
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

      {/* Menus */}
      {page.menus.map((menu) => {
        const formulas = menu.prices.filter((p) => p.kind === "FORMULA");
        const pairings = menu.prices.filter((p) => p.kind === "WINE_PAIRING");
        const main = formulas[0];
        const note = localized(menu, "availabilityNote", locale);
        const description = localized(menu, "description", locale);
        return (
          <section key={menu.id} id={`menu-${menu.slug}`} className={`${c.menuSection} relative overflow-hidden py-24`}>
            <Particles kind={f.particles} count={24} />
            <Reveal className="container relative z-10 max-w-3xl">
              <div className={`relative rounded-[2.5rem] border px-6 pb-14 pt-16 text-center sm:px-14 ${c.menuCard}`}>
                <div
                  className={`absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4 whitespace-nowrap rounded-2xl px-5 py-3 shadow-lg sm:px-7 ${c.badge}`}
                >
                  <span className="font-sans text-sm uppercase tracking-[0.12em] sm:text-lg">{localized(menu, "name", locale)}</span>
                  {main ? <span className="font-display text-xl sm:text-2xl">{euro(main.priceCents)} €</span> : null}
                </div>

                {note ? <p className={`text-[11px] uppercase tracking-[0.3em] ${c.note}`}>{note}</p> : null}
                {main ? <p className={`mt-2 text-sm ${c.sub}`}>{localized(main, "label", locale)}</p> : null}
                {description ? <p className={`mx-auto mt-4 max-w-lg text-sm ${c.dishDesc}`}>{description}</p> : null}

                <div className="mt-10">
                  {menu.sections.map((section, si) => (
                    <Fragment key={section.id}>
                      {si > 0 ? (
                        <span aria-hidden className={`mx-auto my-10 block h-px w-2/5 bg-gradient-to-r from-transparent to-transparent ${c.divider}`} />
                      ) : null}
                      <div>
                        <p className={`text-[11px] uppercase tracking-[0.3em] ${c.kicker}`}>
                          {localized(section, "title", locale)}
                          {section.subtitle ? ` · ${localized(section, "subtitle", locale)}` : ""}
                        </p>
                        <div className="mt-5">
                          {section.dishes.map((dish, di) => (
                            <Fragment key={dish.id}>
                              {di > 0 ? <p className={`my-3 font-display text-base italic ${c.or}`}>{t("or")}</p> : null}
                              <h3 className={`font-display text-xl font-medium sm:text-2xl ${c.dish}`}>{localized(dish, "name", locale)}</h3>
                              {dish.description ? (
                                <p className={`mx-auto mt-1.5 max-w-xl text-sm leading-relaxed sm:text-base ${c.dishDesc}`}>
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
                  <ul className={`mx-auto mt-12 max-w-sm space-y-2 border-t pt-8 text-left text-sm ${c.extraBorder}`}>
                    {[...formulas.slice(1), ...pairings].map((p) => (
                      <li key={p.id} className="flex items-baseline gap-3">
                        <span className={c.label}>{localized(p, "label", locale)}</span>
                        <span aria-hidden className={`flex-1 border-b border-dotted ${c.leader}`} />
                        <span className={`font-display ${c.extraPrice}`}>{euro(p.priceCents)} €</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          </section>
        );
      })}

      {/* Commander / réserver */}
      <section className={`relative py-24 text-center ${c.order}`}>
        <div className="container max-w-2xl">
          <Ornament className="mx-auto w-20" />
          <div className={`mt-8 rounded-[2rem] border-4 border-double px-6 py-12 sm:px-12 ${c.orderBox}`}>
            <p className={`text-[11px] uppercase tracking-[0.35em] ${c.orderKicker}`}>{t("orderKicker")}</p>
            <h2 className={`mt-4 font-display text-3xl font-light italic sm:text-4xl ${c.orderTitle}`}>{t(f.ctaTitleKey)}</h2>
            {orderInfo ? (
              <div className={`mt-7 space-y-4 text-base leading-relaxed ${c.orderText}`}>
                <Paragraphs text={orderInfo} />
              </div>
            ) : null}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {f.showReserve ? (
                <Link href="/reservation" className={`${btn} font-medium ${c.btnPrimary}`}>
                  <CalendarDays className="mr-2 h-4 w-4" aria-hidden />
                  {t("bookTable")}
                </Link>
              ) : null}
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className={`${btn} ${f.showReserve ? `border ${c.btnSecondary}` : `font-medium ${c.btnPrimary}`}`}
                >
                  <Phone className="mr-2 h-4 w-4" aria-hidden />
                  {phone}
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(`${t("orderSubject")} — ${title}`)}`}
                  className={`${btn} border ${c.btnSecondary}`}
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  {t("orderByEmail")}
                </a>
              ) : (
                <Link href="/contact" className={`${btn} border ${c.btnSecondary}`}>
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
