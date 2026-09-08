"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  alt: string | null;
}

// Rythme de colonnes (grille 12) + rapports de forme, répétés en boucle pour
// une composition « magazine » asymétrique plutôt qu'une grille régulière.
const SPANS = [7, 5, 5, 7, 6, 6, 8, 4, 4, 8];
const RATIOS = ["4/3", "3/4", "1/1", "4/3", "3/4", "4/3", "16/10", "1/1", "3/4", "16/10"];

export function EditorialGallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null);

  const move = useCallback(
    (delta: number) =>
      setActive((c) => (c === null ? c : (c + delta + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, move]);

  if (photos.length === 0) return null;
  const current = active !== null ? photos[active] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12 sm:gap-6">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(i)}
            style={{ aspectRatio: RATIOS[i % RATIOS.length] }}
            className={`group relative overflow-hidden bg-ink-100 sm:col-span-${SPANS[i % SPANS.length]}`}
          >
            <Image
              src={photo.url}
              alt={photo.alt ?? ""}
              fill
              className="object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, 40vw"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/95 p-4 sm:p-10"
          onClick={() => setActive(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            aria-label="Précédent"
            className="absolute left-3 text-2xl text-cream-50/60 transition-colors hover:text-cream-50 sm:left-8"
          >
            ‹
          </button>
          <div className="relative h-[82vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.alt ?? ""} fill className="object-contain" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            aria-label="Suivant"
            className="absolute right-3 text-2xl text-cream-50/60 transition-colors hover:text-cream-50 sm:right-8"
          >
            ›
          </button>
          <button
            onClick={() => setActive(null)}
            aria-label="Fermer"
            className="absolute right-4 top-4 text-sm uppercase tracking-widest text-cream-50/60 hover:text-cream-50"
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
