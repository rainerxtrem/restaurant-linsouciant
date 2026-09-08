"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { key: "home", href: "/" },
  { key: "house", href: "/la-maison" },
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            : "border-b border-ink-900/10 bg-cream-50/90 backdrop-blur-md"
        )}
      >
        <div className="container flex h-[72px] items-center justify-between">
          <Link
            href="/"
            aria-label={siteName}
            className="relative block transition-opacity duration-500"
            style={{ opacity: isHome && !scrolled && !open ? 0 : 1 }}
          >
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
            onClick={() => setOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={open}
            className={cn(
              "flex h-10 w-10 items-center justify-center transition-colors",
              darkText ? "text-ink-900" : "text-cream-50"
            )}
          >
            <span className="relative block h-3 w-7">
              <span className="absolute left-0 top-0 block h-px w-7 bg-current" />
              <span className="absolute left-0 top-1.5 block h-px w-7 bg-current" />
              <span className="absolute left-0 top-3 block h-px w-7 bg-current" />
            </span>
          </button>
        </div>
      </header>

      {/* Fond assombri — clic pour fermer */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[55] bg-ink-950/40 backdrop-blur-[2px] transition-opacity duration-[400ms]",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Panneau latéral */}
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-[56] flex h-full w-full max-w-[380px] flex-col bg-ink-950 text-cream-50 shadow-elevated transition-transform duration-[400ms] ease-editorial",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grain opacity-50" />

        <div className="relative flex h-[72px] items-center justify-between px-6">
          <Image src={logoLightUrl} alt={siteName} width={180} height={82} className="h-8 w-auto" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="flex h-10 w-10 items-center justify-center text-cream-100/70 transition-colors hover:text-cream-50"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </div>

        <nav className="relative flex flex-1 flex-col justify-center gap-1 px-8">
          {NAV.map((item, i) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "border-b border-cream-50/10 py-4 font-display text-2xl font-light tracking-tight text-cream-100/85 transition-all duration-500 hover:text-gold-300",
                item.key === "book" && "text-gold-300",
                open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              )}
              style={{ transitionDelay: open ? `${140 + i * 45}ms` : "0ms" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="relative space-y-4 px-8 pb-9 pt-6 text-sm text-cream-100/55">
          {address ? <p className="leading-relaxed">{address}</p> : null}
          <p className="flex flex-col gap-1">
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
          <div className="flex items-center gap-5 pt-1">
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
            <LanguageSwitcher className="ml-auto" />
          </div>
        </div>
      </aside>
    </>
  );
}
