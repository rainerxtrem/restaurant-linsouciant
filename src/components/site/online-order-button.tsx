"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, X } from "lucide-react";

/**
 * Bouton « Commander en ligne » : ouvre le module de commande externe
 * (ex. Zenchef click & collect) en plein écran par-dessus la page, dans une
 * iframe, avec notre propre bouton de fermeture (Échap aussi). Sans JS, le
 * lien ouvre simplement le module dans un nouvel onglet.
 */
export function OnlineOrderButton({
  url,
  label,
  closeLabel,
  className,
}: {
  url: string;
  label: string;
  closeLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Le module peut signaler sa fermeture par postMessage (bouton « fermer »
    // interne) : on ferme si un message de son origine parle de fermeture.
    const origin = (() => {
      try {
        return new URL(url).origin;
      } catch {
        return null;
      }
    })();
    const onMessage = (e: MessageEvent) => {
      if (!origin || e.origin !== origin) return;
      const text = typeof e.data === "string" ? e.data : JSON.stringify(e.data ?? "");
      if (/close/i.test(text)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("message", onMessage);
    };
  }, [open, url]);

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={className}
      >
        <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
        {label}
      </a>

      {mounted && open
        ? createPortal(
            <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[80] flex flex-col bg-ink-950/70 backdrop-blur-sm">
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-full bg-cream-50 px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-900 shadow-elevated hover:bg-white"
                >
                  <X className="h-4 w-4" aria-hidden />
                  {closeLabel}
                </button>
              </div>
              <iframe
                src={url}
                title={label}
                className="mx-auto h-full w-full max-w-5xl flex-1 rounded-t-xl bg-white sm:mb-6 sm:rounded-xl"
                allow="payment"
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
