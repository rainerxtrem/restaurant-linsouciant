"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Parallaxe très légère : translate vertical de l'élément en fonction de sa
 * position dans le viewport. Désactivée si l'utilisateur préfère moins de
 * mouvement.
 */
export function Parallax({
  children,
  amount = 40,
  className,
}: {
  children: ReactNode;
  /** Amplitude max du déplacement en pixels. */
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (élément au-dessus du viewport) → 1 (en-dessous)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      setOffset(Math.max(-1, Math.min(1, progress)) * amount);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [amount]);

  return (
    <div ref={ref} className={className} style={{ transform: `translate3d(0, ${offset}px, 0)` }}>
      {children}
    </div>
  );
}
