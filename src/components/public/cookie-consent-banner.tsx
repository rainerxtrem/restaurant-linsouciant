"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getStoredConsent, setStoredConsent, type CookieConsentValue } from "@/lib/cookie-consent";
import { loadAnalytics } from "@/lib/analytics";

/**
 * Bandeau cookies discret : petite carte en bas à gauche, aux couleurs du
 * site. « Refuser » et « Accepter » ont exactement le même poids visuel
 * (recommandation CNIL : refuser doit être aussi simple qu'accepter).
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (getStoredConsent() !== null) return;
    setVisible(true);
    // Laisse la page s'afficher avant de faire glisser la carte.
    const id = window.setTimeout(() => setShown(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  function choose(value: CookieConsentValue) {
    setStoredConsent(value);
    if (value === "accepted") loadAnalytics();
    setShown(false);
    window.setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  const button =
    "flex-1 border border-ink-900/25 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-800 transition-colors duration-300 hover:border-ink-900 hover:bg-ink-900 hover:text-cream-50";

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 z-50 max-w-sm border border-ink-900/10 bg-cream-50/95 p-6 shadow-elevated backdrop-blur-md transition-all duration-500 ease-editorial sm:bottom-6 sm:left-6 sm:right-auto ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <p className="font-display text-lg font-light italic text-ink-900">Cookies</p>
      <span aria-hidden className="mt-3 block h-px w-8 bg-gold-500/60" />
      <p className="mt-4 text-xs leading-relaxed text-ink-600">
        {t("text")}{" "}
        <Link href="/politique-cookies" className="whitespace-nowrap text-ink-800 underline decoration-gold-500/60 underline-offset-4 hover:decoration-ink-800">
          {t("learnMore")}
        </Link>
      </p>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => choose("rejected")} className={button}>
          {t("reject")}
        </button>
        <button type="button" onClick={() => choose("accepted")} className={button}>
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
