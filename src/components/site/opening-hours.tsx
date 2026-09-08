import { useTranslations } from "next-intl";
import type { OpeningDay } from "@/lib/services/settings.service";
import { groupOpeningHours, isOpenNow } from "@/lib/opening-hours";

/**
 * Horaires d'ouverture. Les couleurs sont relatives à `currentColor` (via
 * opacity) pour rester lisibles aussi bien sur fond clair que sombre.
 */
export function OpeningHours({
  hours,
  showStatus = true,
}: {
  hours: OpeningDay[];
  showStatus?: boolean;
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

      <dl className="space-y-2 text-sm">
        {groups.map((group, i) => {
          const first = group.days[0] ?? "lundi";
          const last = group.days[group.days.length - 1] ?? first;
          const label =
            group.days.length === 1
              ? t(`days.${first}`)
              : `${t(`days.${first}`)} – ${t(`days.${last}`)}`;

          return (
            <div key={i} className="flex items-baseline justify-between gap-6">
              <dt className="whitespace-nowrap opacity-60">{label}</dt>
              <dd className="flex flex-col items-end text-right font-medium">
                {group.closed ? (
                  <span>{t("common.closed")}</span>
                ) : (
                  group.slots.map((s, j) => (
                    <span key={j} className="whitespace-nowrap">
                      {s.start} – {s.end}
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
