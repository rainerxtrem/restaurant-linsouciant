"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Facebook, Instagram } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { key: "home", href: "/" },
  { key: "menus", href: "/menus" },
  { key: "photos", href: "/photos" },
  { key: "giftVouchers", href: "/bons-cadeaux" },
  { key: "contact", href: "/contact" },
  { key: "book", href: "/reservation" },
] as const;

export function SiteHeader({
  siteName,
  logoUrl,
  logoLightUrl = "/logo-light.png",
  phone,
  email,
  address,
  facebookUrl,
  instagramUrl,
}: {
  siteName: string;
  logoUrl?: string | null;
  logoLightUrl?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sur l'accueil : barre transparente au-dessus du hero, devient opaque au
  // défilement. Ailleurs : barre sticky opaque (le contenu descend dessous).
  const transparent = isHome && !scrolled && !open;
  const darkText = !transparent;

  return (
    <>
      <header
        className={cn(
          "z-50 w-full transition-colors duration-500",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          transparent
            ? "bg-transparent"
            : "border-b border-ink-900/10 bg-cream-50/85 backdrop-blur-md"
        )}
      >
        <div className="container flex h-[72px] items-center justify-between">
          <Link href="/" aria-label={siteName} className="relative block">
            <Image
              src={darkText ? logoUrl ?? logoLightUrl : logoLightUrl}
              alt={siteName}
              width={240}
              height={110}
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            className={cn(
              "relative z-[70] flex h-10 w-10 items-center justify-center transition-colors",
              open ? "text-cream-50" : darkText ? "text-ink-900" : "text-cream-50"
            )}
          >
            <span className="relative block h-3 w-7">
              <span
                className={cn(
                  "absolute left-0 top-0 block h-px w-7 bg-current transition-all duration-300",
                  open && "top-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-px w-7 bg-current transition-opacity duration-200",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 block h-px w-7 bg-current transition-all duration-300",
                  open && "top-1.5 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Overlay plein écran */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-ink-950 text-cream-50 transition-[opacity,visibility] duration-500",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />
        <div className="container relative flex h-[72px] items-center">
          <Image src={logoLightUrl} alt={siteName} width={200} height={92} className="h-9 w-auto" />
        </div>

        <nav className="relative flex flex-1 flex-col items-center justify-center gap-1 sm:gap-2">
          {NAV.map((item, i) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "font-display text-3xl font-light tracking-tight text-cream-100/90 transition-all duration-500 hover:text-gold-300 sm:text-5xl",
                item.key === "book" && "mt-4 text-gold-300",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              )}
              style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="relative border-t border-cream-50/10">
          <div className="container flex flex-col items-center gap-4 py-7 text-center text-sm text-cream-100/60 sm:flex-row sm:justify-between sm:text-left">
            <div className="space-y-1">
              {address ? <p>{address}</p> : null}
              <p className="flex flex-wrap justify-center gap-x-3 sm:justify-start">
                {phone ? (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-gold-300">
                    {phone}
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="hover:text-gold-300">
                    {email}
                  </a>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-5">
              {facebookUrl ? (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gold-300">
                  <Facebook className="h-4 w-4" />
                </a>
              ) : null}
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold-300">
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              <LanguageSwitcher className="text-cream-100/60" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
