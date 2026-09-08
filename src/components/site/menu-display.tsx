import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { MenuWithRelations } from "@/lib/services/menu.service";
import { localized } from "@/lib/i18n";
import { Reveal } from "@/components/public/reveal";

function euro(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " €";
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-ink-700">{label}</span>
      <span className="mx-1 flex-1 translate-y-[-3px] border-b border-dotted border-ink-900/25" />
      <span className="font-display text-base text-wine-700">{value}</span>
    </div>
  );
}

export function MenuDisplay({
  menu,
  locale,
  index,
}: {
  menu: MenuWithRelations;
  locale: Locale;
  index: number;
}) {
  const t = useTranslations("menus");
  const formulas = menu.prices.filter((p) => p.kind === "FORMULA");
  const pairings = menu.prices.filter((p) => p.kind === "WINE_PAIRING");

  return (
    <section
      id={`menu-${menu.slug}`}
      className={`scroll-mt-24 py-24 sm:py-36 ${index % 2 === 1 ? "bg-cream-100" : "bg-cream-50"}`}
    >
      <div className="container max-w-2xl text-center">
        <Reveal>
          {localized(menu, "availabilityNote", locale) ? (
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-600">
              {localized(menu, "availabilityNote", locale)}
            </p>
          ) : null}
          <h2 className="mt-4 font-display text-4xl font-light tracking-tight text-ink-900 sm:text-5xl">
            {localized(menu, "name", locale)}
          </h2>
          <span className="mx-auto mt-6 block h-px w-12 bg-gold-400" />
          {localized(menu, "description", locale) ? (
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink-600">
              {localized(menu, "description", locale)}
            </p>
          ) : null}
        </Reveal>

        {/* Prix */}
        {(formulas.length > 0 || pairings.length > 0) && (
          <Reveal delay={100}>
            <div className="mx-auto mt-14 max-w-md space-y-10 text-left">
              {formulas.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-center text-[10px] uppercase tracking-[0.25em] text-ink-400">
                    {t("formulas")}
                  </p>
                  {formulas.map((p) => (
                    <PriceRow key={p.id} label={localized(p, "label", locale)} value={euro(p.priceCents)} />
                  ))}
                </div>
              ) : null}
              {pairings.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-center text-[10px] uppercase tracking-[0.25em] text-ink-400">
                    {t("winePairing")}
                  </p>
                  {pairings.map((p) => (
                    <PriceRow key={p.id} label={localized(p, "label", locale)} value={euro(p.priceCents)} />
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        )}

        {/* Sections & plats */}
        {menu.sections.length > 0 ? (
          <div className="mt-20 space-y-16">
            {menu.sections.map((section) => (
              <Reveal key={section.id}>
                <div>
                  <div className="mx-auto flex max-w-xs items-center gap-4">
                    <span className="h-px flex-1 bg-ink-900/15" />
                    <h3 className="font-display text-lg tracking-[0.15em] text-ink-900">
                      {localized(section, "title", locale)}
                    </h3>
                    <span className="h-px flex-1 bg-ink-900/15" />
                  </div>
                  {localized(section, "subtitle", locale) ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold-600">
                      {localized(section, "subtitle", locale)}
                    </p>
                  ) : null}
                  <ul className="mt-8 space-y-8">
                    {section.dishes.map((dish) => (
                      <li key={dish.id}>
                        <p className="font-display text-xl font-light text-ink-900">
                          {localized(dish, "name", locale)}
                        </p>
                        {localized(dish, "description", locale) ? (
                          <p className="mx-auto mt-1.5 max-w-md text-sm italic leading-relaxed text-ink-500">
                            {localized(dish, "description", locale)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
