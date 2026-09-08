"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden bg-cream-50 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "page-fade .4s ease both" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center text-ink-500 hover:text-ink-900"
        >
          ✕
        </button>

        {imageUrl ? (
          <div className="relative aspect-[16/9] w-full">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="512px" />
          </div>
        ) : null}

        <div className="px-8 py-10">
          <div
            className="prose prose-sm max-w-none text-ink-700 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {buttonLabel && buttonUrl ? (
            <div className="mt-7 text-center">
              {isInternal ? (
                <Link href={buttonUrl} onClick={close} className="btn-cta">
                  {buttonLabel}
                </Link>
              ) : (
                <a href={buttonUrl} target="_blank" rel="noopener noreferrer" className="btn-cta">
                  {buttonLabel}
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
