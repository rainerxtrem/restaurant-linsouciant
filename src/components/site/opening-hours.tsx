import { useTranslations } from "next-intl";
import type { OpeningDay } from "@/lib/services/settings.service";
import { groupOpeningHours, isOpenNow } from "@/lib/opening-hours";

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
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]">
          <span
            className={`h-2 w-2 rounded-full ${open ? "bg-green-600" : "bg-wine-600"}`}
            aria-hidden
          />
          {open ? t("common.openNow") : t("common.closedNow")}
        </p>
      ) : null}
      <dl className="space-y-1.5 text-sm">
        {groups.map((group, i) => {
          const first = group.days[0] ?? "lundi";
          const last = group.days[group.days.length - 1] ?? first;
          return (
          <div key={i} className="flex justify-between gap-4">
            <dt className="text-ink-500">
              {group.days.length === 1
                ? t(`days.${first}`)
                : `${t(`days.${first}`)} – ${t(`days.${last}`)}`}
            </dt>
            <dd className="text-right font-medium text-ink-800">
              {group.closed
                ? t("common.closed")
                : group.slots.map((s) => `${s.start} – ${s.end}`).join(" · ")}
            </dd>
          </div>
          );
        })}
      </dl>
    </div>
  );
}
