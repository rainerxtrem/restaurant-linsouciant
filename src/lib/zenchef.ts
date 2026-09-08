/**
 * Lecture des disponibilités de réservation Zenchef via le middleware public
 * du widget (aucune authentification — c'est la même source que le module de
 * réservation lui-même). Le token API Zenchef (ZENCHEF_API_KEY) n'est pas
 * requis ici ; il reste disponible pour d'éventuels appels serveur.
 */

const BASE = "https://bookings-middleware.zenchef.com";

interface Summary {
  date: string;
  isOpen: boolean;
}

interface SlotDay {
  date: string;
  shifts: {
    name: string;
    shift_slots: {
      slot_name: string;
      closed: boolean;
      possible_guests: number[];
      occupation?: { scheduled?: { available?: number } };
    }[];
  }[];
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export interface NextAvailability {
  /** Date ISO (yyyy-MM-dd) du prochain service ouvert. */
  date: string;
  /** Créneaux groupés par service (Déjeuner / Dîner). */
  shifts: { name: string; slots: string[] }[];
}

export async function getNextAvailability(
  restaurantId: string,
  guests = 2
): Promise<NextAvailability | null> {
  if (!restaurantId) return null;

  try {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 21);

    const summaryRes = await fetch(
      `${BASE}/getAvailabilitiesSummary?restaurantId=${restaurantId}&date_begin=${fmt(from)}&date_end=${fmt(to)}`,
      { next: { revalidate: 900 }, headers: { accept: "application/json" } }
    );
    if (!summaryRes.ok) return null;
    const summary = (await summaryRes.json()) as Summary[];
    const firstOpen = summary.find((d) => d.isOpen);
    if (!firstOpen) return null;

    const dayRes = await fetch(
      `${BASE}/getAvailabilities?restaurantId=${restaurantId}&date_begin=${firstOpen.date}&date_end=${firstOpen.date}&guests=${guests}`,
      { next: { revalidate: 900 }, headers: { accept: "application/json" } }
    );
    if (!dayRes.ok) return null;
    const days = (await dayRes.json()) as SlotDay[];
    const day = days.find((d) => d.date === firstOpen.date) ?? days[0];
    if (!day) return null;

    const shifts = day.shifts
      .map((shift) => ({
        name: shift.name,
        slots: shift.shift_slots
          .filter(
            (s) =>
              !s.closed &&
              s.possible_guests.includes(guests) &&
              (s.occupation?.scheduled?.available ?? 1) >= guests
          )
          .map((s) => s.slot_name),
      }))
      .filter((s) => s.slots.length > 0);

    return shifts.length > 0 ? { date: firstOpen.date, shifts } : null;
  } catch {
    return null;
  }
}
