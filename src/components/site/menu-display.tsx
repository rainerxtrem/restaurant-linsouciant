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
    <article id={`menu-${menu.slug}`} className="scroll-mt-28">
      <header className="border-b border-ink-900/10 pb-6">
        <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">{localized(menu, "name", locale)}</h2>
        {localized(menu, "availabilityNote", locale) ? (
          <p className="mt-2 text-sm uppercase tracking-wide text-gold-600">
            {localized(menu, "availabilityNote", locale)}
          </p>
        ) : null}
        {localized(menu, "description", locale) ? (
          <p className="mt-4 max-w-2xl text-ink-600">{localized(menu, "description", locale)}</p>
        ) : null}
      </header>

      {(formulas.length > 0 || pairings.length > 0) && (
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {formulas.length > 0 ? (
            <div>
              <p className="eyebrow">{t("formulas")}</p>
              <ul className="mt-3 space-y-2">
                {formulas.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-700">{localized(p, "label", locale)}</span>
                    <span className="font-display text-lg text-wine-700">{euro(p.priceCents)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {pairings.length > 0 ? (
            <div>
              <p className="eyebrow">{t("winePairing")}</p>
              <ul className="mt-3 space-y-2">
                {pairings.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-700">{localized(p, "label", locale)}</span>
                    <span className="font-display text-lg text-wine-700">{euro(p.priceCents)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {menu.sections.length > 0 ? (
        <div className="mt-10 space-y-8">
          {menu.sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-display text-xl text-ink-900">{localized(section, "title", locale)}</h3>
              {localized(section, "subtitle", locale) ? (
                <p className="text-sm italic text-ink-500">{localized(section, "subtitle", locale)}</p>
              ) : null}
              <ul className="mt-3 space-y-3">
                {section.dishes.map((dish) => (
                  <li key={dish.id}>
                    <p className="font-medium text-ink-800">{localized(dish, "name", locale)}</p>
                    {localized(dish, "description", locale) ? (
                      <p className="text-sm text-ink-600">{localized(dish, "description", locale)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
