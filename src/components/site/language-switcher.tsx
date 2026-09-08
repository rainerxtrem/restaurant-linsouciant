"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wider", className)}>
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 ? <span className="text-ink-300">/</span> : null}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale ? "true" : undefined}
            className={cn(
              "transition-colors",
              loc === locale ? "text-wine-700" : "text-ink-400 hover:text-ink-700"
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
