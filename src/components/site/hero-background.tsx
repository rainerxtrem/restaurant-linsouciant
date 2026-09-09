"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Fond du hero de la page d'accueil :
 *  - fichier vidéo local (.mp4 / .webm, ou URL directe) → <video> lu
 *    immédiatement, sans image d'attente ;
 *  - URL YouTube → iframe montée après le premier rendu (poids), avec
 *    l'image poster visible en attendant ;
 *  - sinon → image seule avec un léger zoom.
 */

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  return m ? (m[1] ?? null) : null;
}

const isVideoFile = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.startsWith("/");

export function HeroBackground({
  videoUrl,
  posterUrl,
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
}) {
  const ytId = videoUrl && !isVideoFile(videoUrl) ? youTubeId(videoUrl) : null;
  const [ytReady, setYtReady] = useState(false);

  useEffect(() => {
    if (!ytId) return;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const trigger = () => setYtReady(true);
    const id = w.requestIdleCallback ? w.requestIdleCallback(trigger) : window.setTimeout(trigger, 1400);
    return () => {
      if (w.requestIdleCallback) w.cancelIdleCallback?.(id);
      else clearTimeout(id);
    };
  }, [ytId]);

  // Vidéo locale : lecture directe, aucune image intermédiaire.
  if (videoUrl && isVideoFile(videoUrl)) {
    const webm = videoUrl.replace(/\.mp4(\?|$)/i, ".webm$1");
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-55"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        {webm !== videoUrl ? <source src={webm} type="video/webm" /> : null}
        <source src={videoUrl} type="video/mp4" />
      </video>
    );
  }

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

      {ytId && ytReady ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3`}
          title=""
          aria-hidden
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-screen min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 animate-[page-fade_1s_ease_both] opacity-55"
        />
      ) : null}
    </div>
  );
}
