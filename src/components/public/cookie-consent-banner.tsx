"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getStoredConsent, setStoredConsent, type CookieConsentValue } from "@/lib/cookie-consent";
import { loadAnalytics } from "@/lib/analytics";

export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  function choose(value: CookieConsentValue) {
    setStoredConsent(value);
    if (value === "accepted") loadAnalytics();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold-400/30 bg-ink-950 text-cream-100 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="container flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
        <p className="max-w-3xl text-sm leading-relaxed text-cream-100/85">
          {t("text")}{" "}
          <Link href="/politique-cookies" className="whitespace-nowrap font-medium text-gold-300 underline underline-offset-2 hover:text-gold-200">
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="whitespace-nowrap rounded-sm border border-cream-100/30 px-4 py-2 text-sm font-medium text-cream-100 transition-colors hover:border-cream-100 hover:bg-cream-100/10"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="whitespace-nowrap rounded-sm bg-gold-400 px-5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-300"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
