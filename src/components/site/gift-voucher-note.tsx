import { Gift } from "lucide-react";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content/page-content";
import { cn } from "@/lib/utils/cn";

/**
 * Rappel : préciser à la réservation qu'on vient avec un bon cadeau, sans
 * quoi il n'est pas pris en compte au paiement. Texte éditable dans
 * Pages → Réservation ; même présentation partout (réservation, cartes &
 * menus, accès & contact).
 */
export async function GiftVoucherNote({ className }: { className?: string }) {
  const locale = (await getLocale()) as Locale;
  const c = await getPageContent("reservation", locale);
  const text = c.text("giftVoucherNote");
  if (!text) return null;
  return (
    <p
      className={cn(
        "flex max-w-sm items-start gap-2.5 border-l border-gold-500/50 pl-4 text-left text-xs leading-relaxed text-ink-600",
        className
      )}
    >
      <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />
      <span>{text}</span>
    </p>
  );
}
