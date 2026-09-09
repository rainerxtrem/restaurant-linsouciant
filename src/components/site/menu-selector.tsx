"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

export interface MenuView {
  slug: string;
  name: string;
  nameEn: string | null;
  availabilityNote: string | null;
  availabilityNoteEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  prices: {
    id: string;
    kind: "FORMULA" | "WINE_PAIRING";
    label: string;
    labelEn: string | null;
    priceCents: number;
  }[];
  sections: {
    id: string;
    title: string;
    titleEn: string | null;
    subtitle: string | null;
    subtitleEn: string | null;
    dishes: {
      id: string;
      name: string;
      nameEn: string | null;
      description: string | null;
      descriptionEn: string | null;
    }[];
  }[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function euro(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 });
}

/** Sépare « Balade de saison — 4 plats (entrée, poisson…) » en titre + détail. */
function splitLabel(label: string): { main: string; detail: string | null } {
  const m = label.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { main: m[1]!.trim(), detail: m[2]!.trim() };
  return { main: label, detail: null };
}

function PriceRow({ label, cents }: { label: string; cents: number }) {
  const { main, detail } = splitLabel(label);
  return (
    <li className="flex items-baseline justify-between gap-5">
      <span className="min-w-0">
        <span className="text-ink-800">{main}</span>
        {detail ? <span className="mt-0.5 block text-xs leading-snug text-ink-400">{detail}</span> : null}
      </span>
      <span className="shrink-0 whitespace-nowrap font-display text-base text-wine-700">
        {euro(cents)} €
      </span>
    </li>
  );
}

export function MenuSelector({ menus, locale }: { menus: MenuView[]; locale: "fr" | "en" }) {
  const t = useTranslations("menus");
  const L = (fr: string | null, en: string | null) => (locale === "en" && en ? en : fr) ?? "";

  const [active, setActive] = useState(0);

  useEffect(() => {
    const fromHash = () => {
      const slug = window.location.hash.replace(/^#(menu-)?/, "");
      const i = menus.findIndex((m) => m.slug === slug);
      if (i >= 0) setActive(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [menus]);

  function select(i: number) {
    setActive(i);
    const m = menus[i];
    if (m && typeof history !== "undefined") {
      history.replaceState(null, "", `#menu-${m.slug}`);
    }
  }

  const ranges = useMemo(
    () =>
      menus.map((m) => {
        const f = m.prices.filter((p) => p.kind === "FORMULA").map((p) => p.priceCents);
        if (f.length === 0) return null;
        const lo = Math.min(...f);
        const hi = Math.max(...f);
        return lo === hi ? `${euro(lo)} €` : `${euro(lo)} – ${euro(hi)} €`;
      }),
    [menus]
  );

  const menu = menus[active];
  if (!menu) return null;

  const formulas = menu.prices.filter((p) => p.kind === "FORMULA");
  const pairings = menu.prices.filter((p) => p.kind === "WINE_PAIRING");

  return (
    <div className="bg-cream-50">
      {/* Sélecteur */}
      <div className="sticky top-[72px] z-20 border-b border-ink-900/10 bg-cream-50/92 backdrop-blur">
        <div className="container flex flex-wrap items-stretch justify-center divide-x divide-ink-900/10">
          {menus.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => select(i)}
              aria-current={i === active ? "true" : undefined}
              className="group relative px-6 py-5 text-center transition-colors sm:px-10"
            >
              <span
                className={cn(
                  "block font-display text-lg font-light tracking-tight transition-colors sm:text-xl",
                  i === active ? "text-ink-900" : "text-ink-400 group-hover:text-ink-700"
                )}
              >
                {L(m.name, m.nameEn)}
              </span>
              {ranges[i] ? (
                <span
                  className={cn(
                    "mt-1 block text-[10px] uppercase tracking-[0.2em] transition-colors",
                    i === active ? "text-gold-600" : "text-ink-300"
                  )}
                >
                  {ranges[i]}
                </span>
              ) : null}
              <span
                className={cn(
                  "absolute inset-x-6 -bottom-px h-px bg-gold-500 transition-transform duration-300 sm:inset-x-10",
                  i === active ? "scale-x-100" : "scale-x-0"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Carte du menu sélectionné */}
      <div className="container py-16 sm:py-24">
        <div key={menu.slug} className="page-fade mx-auto max-w-2xl">
          <div className="relative border border-ink-900/15 p-6 sm:p-14">
            <div className="pointer-events-none absolute inset-2 border border-gold-400/25 sm:inset-3" />
            <span className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 font-display text-[7rem] leading-none text-ink-900/[0.04] sm:text-[10rem]">
              {ROMAN[active] ?? active + 1}
            </span>

            <div className="relative text-center">
              {L(menu.availabilityNote, menu.availabilityNoteEn) ? (
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold-600">
                  {L(menu.availabilityNote, menu.availabilityNoteEn)}
                </p>
              ) : null}
              <h2 className="mt-4 font-display text-4xl font-light tracking-tight text-ink-900 sm:text-5xl">
                {L(menu.name, menu.nameEn)}
              </h2>
              <span className="mx-auto mt-6 block h-px w-12 bg-gold-400" />
              {L(menu.description, menu.descriptionEn) ? (
                <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-600">
                  {L(menu.description, menu.descriptionEn)}
                </p>
              ) : null}

              {/* Prix */}
              {(formulas.length > 0 || pairings.length > 0) && (
                <div className="mx-auto mt-10 max-w-md border-y border-ink-900/10 py-7 text-left text-sm">
                  {formulas.length > 0 ? (
                    <ul className="space-y-3.5">
                      {formulas.map((p) => (
                        <PriceRow key={p.id} label={L(p.label, p.labelEn)} cents={p.priceCents} />
                      ))}
                    </ul>
                  ) : null}
                  {pairings.length > 0 ? (
                    <div className={formulas.length > 0 ? "mt-6 border-t border-ink-900/10 pt-6" : ""}>
                      <p className="mb-3.5 text-center text-[10px] uppercase tracking-[0.25em] text-ink-400">
                        {t("winePairing")}
                      </p>
                      <ul className="space-y-3.5">
                        {pairings.map((p) => (
                          <PriceRow key={p.id} label={L(p.label, p.labelEn)} cents={p.priceCents} />
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Sections */}
              {menu.sections.length > 0 ? (
                <div className="mt-14 space-y-14">
                  {menu.sections.map((section) => (
                    <div key={section.id}>
                      <div className="mx-auto flex max-w-[16rem] items-center gap-4">
                        <span className="h-px flex-1 bg-ink-900/15" />
                        <h3 className="font-display text-base tracking-[0.2em] text-ink-900">
                          {L(section.title, section.titleEn)}
                        </h3>
                        <span className="h-px flex-1 bg-ink-900/15" />
                      </div>
                      {L(section.subtitle, section.subtitleEn) ? (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gold-600">
                          {L(section.subtitle, section.subtitleEn)}
                        </p>
                      ) : null}
                      <ul className="mt-7 space-y-7">
                        {section.dishes.map((dish) => (
                          <li key={dish.id}>
                            <p className="font-display text-xl font-light text-ink-900">
                              {L(dish.name, dish.nameEn)}
                            </p>
                            {L(dish.description, dish.descriptionEn) ? (
                              <p className="mx-auto mt-1.5 max-w-md text-sm italic leading-relaxed text-ink-500">
                                {L(dish.description, dish.descriptionEn)}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
