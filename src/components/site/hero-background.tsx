"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Fond du hero de la page d'accueil :
 *  - URL YouTube → iframe (auto, muette, boucle) montée APRÈS le premier
 *    rendu pour ne pas peser sur le LCP ; l'image poster reste visible
 *    dessous et le temps du chargement.
 *  - fichier vidéo (.mp4 / .webm) → <video> natif.
 *  - sinon → image seule avec un léger zoom (géré côté page).
 */

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  return m ? (m[1] ?? null) : null;
}

export function HeroBackground({
  videoUrl,
  posterUrl,
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const trigger = () => setReady(true);
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(trigger)
      : window.setTimeout(trigger, 1400);
    return () => {
      if (w.requestIdleCallback) w.cancelIdleCallback?.(id);
      else clearTimeout(id);
    };
  }, [videoUrl]);

  const ytId = videoUrl ? youTubeId(videoUrl) : null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          priority
          quality={70}
          className="hero-kenburns object-cover opacity-55"
          sizes="100vw"
        />
      ) : null}

      {!videoUrl ? null : ready && ytId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3`}
          title=""
          aria-hidden
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-screen min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 animate-[page-fade_1s_ease_both] opacity-55"
        />
      ) : ready ? (
        <video
          className="absolute inset-0 h-full w-full animate-[page-fade_1s_ease_both] object-cover opacity-55"
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl ?? undefined}
        >
          <source src={videoUrl} />
        </video>
      ) : null}
    </div>
  );
}
