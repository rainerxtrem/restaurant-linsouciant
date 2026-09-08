"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * Sélecteur de langue. Les couleurs sont relatives à `currentColor` (via
 * opacity) pour rester lisible aussi bien sur fond clair que sur l'overlay
 * sombre du menu.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]", className)}>
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1.5">
          {i > 0 ? <span className="opacity-30">/</span> : null}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale ? "true" : undefined}
            className={cn(
              "transition-opacity",
              loc === locale ? "opacity-100" : "opacity-45 hover:opacity-80"
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
