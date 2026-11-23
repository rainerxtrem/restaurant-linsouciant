import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Phone, Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n";
import { toMenuView } from "@/lib/menu-view";
import { parseProductPrices } from "@/lib/validation/theme-page";
import type { getEnabledThemePageBySlug } from "@/lib/services/theme-page.service";
import { MenuSelector } from "@/components/site/menu-selector";
import { Reveal } from "@/components/public/reveal";

type ThemePageFull = NonNullable<Awaited<ReturnType<typeof getEnabledThemePageBySlug>>>;

function euro(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Paragraphes séparés par une ligne vide, retours à la ligne conservés. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className}>
            {p.split("\n").map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        ))}
    </>
  );
}

export async function ThemePageView({
  page,
  locale,
  siteName,
  phone,
  email,
}: {
  page: ThemePageFull;
  locale: Locale;
  siteName: string;
  phone: string | null;
  email: string | null;
}) {
  const t = await getTranslations("themePage");
  const title = localized(page, "title", locale);
  const intro = localized(page, "intro", locale);
  const orderInfo = localized(page, "orderInfo", locale);
  const menus = page.menus.map(toMenuView);

  const contactButtons = (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {phone ? (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-cta">
          <Phone className="mr-2 h-4 w-4" aria-hidden />
          {phone}
        </a>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`${t("orderSubject")} — ${title}`)}`}
          className="inline-flex items-center border-b border-ink-900/30 pb-1 text-xs uppercase tracking-[0.2em] text-ink-800 transition-colors hover:border-wine-700 hover:text-wine-700"
        >
          <Mail className="mr-2 h-3.5 w-3.5" aria-hidden />
          {t("orderByEmail")}
        </a>
      ) : (
        <Link href="/contact" className="link-underline text-xs uppercase tracking-[0.2em]">
          {t("contactUs")}
        </Link>
      )}
    </div>
  );

  return (
    <div>
      {/* Bandeau */}
      <section className="relative flex h-[62svh] min-h-[400px] items-center justify-center overflow-hidden bg-ink-950 text-cream-50">
        {page.heroImage ? (
          <Image
            src={page.heroImage.url}
            alt=""
            fill
            priority
            className="object-cover opacity-45"
            sizes="100vw"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/30 to-ink-950/80" />
        <div className="relative z-10 px-6 text-center">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold-300">{siteName}</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 font-display text-5xl font-light tracking-tight sm:text-6xl">{title}</h1>
          </Reveal>
          <Reveal delay={160}>
            <span className="mx-auto mt-7 block h-px w-14 bg-gold-400/70" />
          </Reveal>
        </div>
      </section>

      {intro ? (
        <section className="bg-cream-50 pt-20">
          <Reveal className="container max-w-2xl space-y-4 text-center text-base leading-relaxed text-ink-600">
            <Paragraphs text={intro} />
          </Reveal>
        </section>
      ) : null}

      {/* Encadrés produits */}
      {page.products.length > 0 ? (
        <section className="bg-cream-50 py-20">
          <div className="container max-w-5xl space-y-10">
            {page.products.map((product, i) => {
              const prices = parseProductPrices(product.prices);
              const name = localized(product, "name", locale);
              const description = localized(product, "description", locale);
              const reversed = i % 2 === 1;
              // Sans photo : le texte occupe tout l'encadré (pas de bloc vide).
              const hasImage = Boolean(product.image);
              return (
                <Reveal key={product.id}>
                  <article className="border border-ink-900/15 bg-cream-50 p-2">
                    <div
                      className={`grid border border-ink-900/10 ${hasImage ? "md:grid-cols-2" : ""} ${
                        hasImage && reversed ? "md:[&>*:first-child]:order-2" : ""
                      }`}
                    >
                      {product.image ? (
                        <div className="relative aspect-[4/3] bg-cream-100 md:aspect-auto md:min-h-[340px]">
                          <Image
                            src={product.image.url}
                            alt={localized(product.image, "alt", locale) || name}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
                          />
                        </div>
                      ) : null}
                      <div
                        className={`flex flex-col justify-center px-7 py-10 sm:px-10 ${
                          hasImage ? "" : "mx-auto w-full max-w-2xl"
                        }`}
                      >
                        <h2 className="font-display text-3xl font-light tracking-tight text-ink-900">{name}</h2>
                        <span className="mt-5 block h-px w-10 bg-gold-500/70" />
                        {description ? (
                          <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-600">
                            <Paragraphs text={description} />
                          </div>
                        ) : null}
                        {prices.length > 0 ? (
                          <ul className="mt-7 space-y-3 text-sm">
                            {prices.map((p, k) => {
                              const lbl = (locale === "en" && p.labelEn) || p.label;
                              return (
                                <li key={k} className="flex items-baseline gap-3">
                                  <span className="text-ink-800">{lbl}</span>
                                  {lbl ? (
                                    <span aria-hidden className="min-w-6 flex-1 border-b border-dotted border-ink-900/25" />
                                  ) : null}
                                  <span className="ml-auto shrink-0 whitespace-nowrap font-display text-lg text-wine-700">
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
        </section>
      ) : null}

      {/* Menus rattachés (ex. menu de Noël) */}
      {menus.length > 0 ? (
        <section className="border-t border-ink-900/10">
          <div className="bg-cream-50 pt-20 text-center">
            <p className="kicker">{menus.length > 1 ? t("menusTitle") : t("menuTitle")}</p>
          </div>
          <MenuSelector menus={menus} locale={locale} />
        </section>
      ) : null}

      {/* Commander */}
      <section className="border-t border-ink-900/10 bg-cream-100 py-20 text-center">
        <div className="container max-w-2xl">
          <p className="kicker">{t("orderKicker")}</p>
          <h2 className="mt-5 font-display text-3xl font-light text-ink-900">{t("orderTitle")}</h2>
          {orderInfo ? (
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-ink-600">
              <Paragraphs text={orderInfo} />
            </div>
          ) : null}
          {contactButtons}
        </div>
      </section>
    </div>
  );
}
