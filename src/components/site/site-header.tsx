"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { key: "home", href: "/" },
  { key: "menus", href: "/menus" },
  { key: "photos", href: "/photos" },
  { key: "giftVouchers", href: "/bons-cadeaux" },
  { key: "contact", href: "/contact" },
] as const;

export function SiteHeader({
  siteName,
  tagline,
  logoUrl,
}: {
  siteName: string;
  tagline: string;
  logoUrl?: string | null;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-ink-900/10 bg-cream-50/95 backdrop-blur">
        <div className="container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={siteName}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={260}
                height={120}
                priority
                className="h-11 w-auto sm:h-14"
              />
            ) : (
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-medium tracking-wide text-ink-900 sm:text-xl">
                  {siteName}
                </span>
                <span className="mt-1 hidden text-[10px] uppercase tracking-[0.25em] text-gold-600 sm:block">
                  {tagline}
                </span>
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="link-sweep rounded-sm px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-wine-700"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/reservation"
              className="ml-2 whitespace-nowrap rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
            >
              {t("book")}
            </Link>
            <LanguageSwitcher className="ml-3" />
          </nav>

          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center text-ink-900 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
          >
            <span className="relative block h-4 w-6">
              <span className={cn("absolute left-0 top-0 block h-0.5 w-6 bg-current transition-transform duration-300", open && "translate-y-[7px] rotate-45")} />
              <span className={cn("absolute left-0 top-[7px] block h-0.5 w-6 bg-current transition-opacity duration-200", open && "opacity-0")} />
              <span className={cn("absolute left-0 top-[14px] block h-0.5 w-6 bg-current transition-transform duration-300", open && "-translate-y-[7px] -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-20 z-40 bg-cream-50 transition-transform duration-300 lg:hidden",
          open ? "visible translate-y-0" : "invisible -translate-y-2"
        )}
      >
        <nav className="container flex flex-col divide-y divide-ink-900/10 pt-4">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href} className="py-4 font-display text-2xl text-ink-900">
              {t(item.key)}
            </Link>
          ))}
          <Link href="/reservation" className="py-4 font-display text-2xl text-wine-700">
            {t("book")}
          </Link>
          <div className="py-5">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
