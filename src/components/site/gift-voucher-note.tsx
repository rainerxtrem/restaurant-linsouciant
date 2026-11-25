import { Gift } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils/cn";

/**
 * Rappel : préciser à la réservation qu'on vient avec un bon cadeau, sans
 * quoi il n'est pas pris en compte au paiement. Même présentation partout
 * (réservation, cartes & menus, accès & contact).
 */
export async function GiftVoucherNote({ className }: { className?: string }) {
  const t = await getTranslations("reservation");
  return (
    <p
      className={cn(
        "flex max-w-sm items-start gap-2.5 border-l border-gold-500/50 pl-4 text-left text-xs leading-relaxed text-ink-600",
        className
      )}
    >
      <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />
      <span>{t("giftVoucherNote")}</span>
    </p>
  );
}
