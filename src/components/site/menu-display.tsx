import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { MenuWithRelations } from "@/lib/services/menu.service";
import { localized } from "@/lib/i18n";

function euro(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " €";
}

export function MenuDisplay({ menu, locale }: { menu: MenuWithRelations; locale: Locale }) {
  const t = useTranslations("menus");
  const formulas = menu.prices.filter((p) => p.kind === "FORMULA");
  const pairings = menu.prices.filter((p) => p.kind === "WINE_PAIRING");

  return (
    <article
      id={`menu-${menu.slug}`}
      className="scroll-mt-28 overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-card"
    >
      {/* Bandeau titre */}
      <header className="relative bg-ink-950 px-6 py-10 text-center text-cream-50 sm:px-12 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-70" />
        <div className="relative">
          {localized(menu, "availabilityNote", locale) ? (
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold-300">
              {localized(menu, "availabilityNote", locale)}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-light tracking-tight sm:text-4xl">
            {localized(menu, "name", locale)}
          </h2>
          <span className="mx-auto mt-4 block h-px w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          {localized(menu, "description", locale) ? (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream-100/70">
              {localized(menu, "description", locale)}
            </p>
          ) : null}
        </div>
      </header>

      <div className="px-6 py-10 sm:px-12 sm:py-12">
        {/* Prix */}
        {(formulas.length > 0 || pairings.length > 0) && (
          <div className="mb-12 grid gap-10 sm:grid-cols-2">
            {formulas.length > 0 ? (
              <div>
                <p className="eyebrow">{t("formulas")}</p>
                <ul className="mt-4 divide-y divide-ink-900/8">
                  {formulas.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-sm text-ink-700">{localized(p, "label", locale)}</span>
                      <span className="shrink-0 font-display text-lg text-wine-700">{euro(p.priceCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {pairings.length > 0 ? (
              <div>
                <p className="eyebrow">{t("winePairing")}</p>
                <ul className="mt-4 divide-y divide-ink-900/8">
                  {pairings.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-sm text-ink-700">{localized(p, "label", locale)}</span>
                      <span className="shrink-0 font-display text-lg text-wine-700">{euro(p.priceCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* Sections & plats */}
        {menu.sections.length > 0 ? (
          <div className="space-y-10">
            {menu.sections.map((section) => (
              <div key={section.id}>
                <div className="mb-4 flex items-center gap-4">
                  <h3 className="font-display text-xl tracking-wide text-ink-900">
                    {localized(section, "title", locale)}
                  </h3>
                  <span className="h-px flex-1 bg-ink-900/10" />
                  {localized(section, "subtitle", locale) ? (
                    <span className="text-xs uppercase tracking-wide text-gold-600">
                      {localized(section, "subtitle", locale)}
                    </span>
                  ) : null}
                </div>
                <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                  {section.dishes.map((dish) => (
                    <li key={dish.id} className="border-l-2 border-gold-300/50 pl-4">
                      <p className="font-display text-base text-ink-900">{localized(dish, "name", locale)}</p>
                      {localized(dish, "description", locale) ? (
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                          {localized(dish, "description", locale)}
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
    </article>
  );
}
