import { useTranslations } from "next-intl";
import type { OpeningDay } from "@/lib/services/settings.service";
import { groupOpeningHours, isOpenNow } from "@/lib/opening-hours";

export function OpeningHours({
  hours,
  showStatus = true,
  variant = "row",
}: {
  hours: OpeningDay[];
  showStatus?: boolean;
  /** "row" : jour à gauche, horaires à droite (contextes larges).
   *  "stack" : jour en label, horaires en dessous (colonnes étroites, pied de page). */
  variant?: "row" | "stack";
}) {
  const t = useTranslations();
  if (hours.length === 0) return null;

  const groups = groupOpeningHours(hours);
  const open = isOpenNow(hours);

  return (
    <div>
      {showStatus ? (
        <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
          <span
            className={`h-2 w-2 rounded-full ${open ? "bg-green-600" : "bg-wine-600"}`}
            aria-hidden
          />
          {open ? t("common.openNow") : t("common.closedNow")}
        </p>
      ) : null}

      <dl className={variant === "stack" ? "space-y-3 text-sm" : "space-y-2.5 text-sm"}>
        {groups.map((group, i) => {
          const first = group.days[0] ?? "lundi";
          const last = group.days[group.days.length - 1] ?? first;
          const label =
            group.days.length === 1
              ? t(`days.${first}`)
              : `${t(`days.${first}`)} – ${t(`days.${last}`)}`;
          const value = group.closed
            ? t("common.closed")
            : group.slots.map((s) => `${s.start} – ${s.end}`);

          if (variant === "stack") {
            return (
              <div key={i}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-400">
                  {label}
                </dt>
                <dd className="mt-1 font-medium leading-snug">
                  {group.closed ? (
                    t("common.closed")
                  ) : (
                    <span className="flex flex-col">
                      {(value as string[]).map((v, j) => (
                        <span key={j}>{v}</span>
                      ))}
                    </span>
                  )}
                </dd>
              </div>
            );
          }

          return (
            <div key={i} className="flex items-start justify-between gap-6">
              <dt className="whitespace-nowrap text-ink-500">{label}</dt>
              <dd className="flex flex-col items-end text-right font-medium text-ink-800">
                {group.closed ? (
                  t("common.closed")
                ) : (
                  (value as string[]).map((v, j) => (
                    <span key={j} className="whitespace-nowrap">
                      {v}
                    </span>
                  ))
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
