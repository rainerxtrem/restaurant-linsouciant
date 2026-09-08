import type { OpeningDay } from "@/lib/services/settings.service";

const ORDER: OpeningDay["day"][] = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

// getDay() : 0 = dimanche … 6 = samedi.
const JS_DAY_TO_KEY: Record<number, OpeningDay["day"]> = {
  0: "dimanche",
  1: "lundi",
  2: "mardi",
  3: "mercredi",
  4: "jeudi",
  5: "vendredi",
  6: "samedi",
};

export function sortDays(days: OpeningDay[]): OpeningDay[] {
  return [...days].sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day));
}

/** true si le restaurant est ouvert à l'instant `now` (heure du serveur). */
export function isOpenNow(days: OpeningDay[], now = new Date()): boolean {
  const key = JS_DAY_TO_KEY[now.getDay()];
  const today = days.find((d) => d.day === key);
  if (!today || today.closed) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":");
    return (Number(h) || 0) * 60 + (Number(m) || 0);
  };
  return today.slots.some((slot) => minutes >= toMinutes(slot.start) && minutes <= toMinutes(slot.end));
}

/** Regroupe les jours consécutifs aux mêmes horaires pour un affichage compact. */
export function groupOpeningHours(
  days: OpeningDay[]
): { days: OpeningDay["day"][]; closed: boolean; slots: { start: string; end: string }[] }[] {
  const sorted = sortDays(days);
  const groups: { days: OpeningDay["day"][]; closed: boolean; slots: { start: string; end: string }[] }[] = [];

  for (const day of sorted) {
    const signature = day.closed ? "closed" : day.slots.map((s) => `${s.start}-${s.end}`).join("|");
    const last = groups[groups.length - 1];
    const lastSig = last
      ? last.closed
        ? "closed"
        : last.slots.map((s) => `${s.start}-${s.end}`).join("|")
      : null;
    if (last && lastSig === signature) {
      last.days.push(day.day);
    } else {
      groups.push({ days: [day.day], closed: day.closed, slots: day.slots });
    }
  }
  return groups;
}
