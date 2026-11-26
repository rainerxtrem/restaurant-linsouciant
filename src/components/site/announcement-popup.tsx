"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "linsouciant.announcement";

export function AnnouncementPopup({
  html,
  imageUrl,
  buttonLabel,
  buttonUrl,
  dismissDays,
  signature,
}: {
  html: string;
  imageUrl?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  dismissDays: number;
  /** Change quand l'annonce est modifiée → le pop-up réapparaît. */
  signature: string;
}) {
  const t = useTranslations("themePage");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw) as { sig?: string; until?: number };
        dismissed = v.sig === signature && typeof v.until === "number" && Date.now() < v.until;
      }
    } catch {
      /* localStorage indisponible → on affiche */
    }
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(timer);
  }, [signature]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sig: signature, until: Date.now() + Math.max(0, dismissDays) * 86400000 })
      );
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  const isInternal = buttonUrl && buttonUrl.startsWith("/");

  return (
    <div
      className="announcement-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/55 p-4 backdrop-blur-sm sm:p-6"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="announcement-card relative flex max-h-[90svh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] bg-cream-50 shadow-[0_40px_90px_-30px_rgba(23,19,15,0.55)] ring-1 ring-gold-500/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fermer : rond blanc bien visible, sur photo comme sur fond clair. */}
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-[0_6px_20px_-6px_rgba(23,19,15,0.45)] ring-1 ring-ink-900/10 transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {imageUrl ? (
            <div className="relative aspect-[16/10] w-full">
              <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 512px" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream-50 to-transparent" />
            </div>
          ) : null}

          <div className={`px-7 pb-8 sm:px-10 sm:pb-10 ${imageUrl ? "pt-4" : "pt-14"}`}>
            <span aria-hidden className="mx-auto mb-6 block h-px w-10 bg-gold-500/70" />
            <div
              className="prose prose-sm max-w-none text-ink-700 [&_h1]:font-display [&_h1]:font-light [&_h2]:font-display [&_h2]:font-light [&_h3]:font-display"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div className="mt-8 flex flex-col items-center gap-4">
              {buttonLabel && buttonUrl ? (
                isInternal ? (
                  <Link href={buttonUrl} onClick={close} className="btn-cta rounded-full px-10">
                    {buttonLabel}
                  </Link>
                ) : (
                  <a href={buttonUrl} target="_blank" rel="noopener noreferrer" className="btn-cta rounded-full px-10">
                    {buttonLabel}
                  </a>
                )
              ) : null}
              <button
                type="button"
                onClick={close}
                className="text-xs uppercase tracking-[0.18em] text-ink-500 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
