"use client";

/**
 * Fond du hero de la page d'accueil :
 *  - URL YouTube  → iframe en lecture auto, muette, en boucle, dimensionnée
 *    pour couvrir tout le hero (les contrôles et l'habillage sont masqués) ;
 *  - fichier vidéo (.mp4 / .webm) → balise <video> native ;
 *  - sinon → rien (la page affiche l'image avec un léger zoom).
 */

function youTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1] ?? null;
  }
  return null;
}

export function HeroBackground({
  videoUrl,
  posterUrl,
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
}) {
  if (!videoUrl) return null;

  const ytId = youTubeId(videoUrl);

  if (ytId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: ytId,
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      disablekb: "1",
      fs: "0",
      iv_load_policy: "3",
    });
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?${params.toString()}`}
          title=""
          aria-hidden
          allow="autoplay; encrypted-media"
          className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-screen min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 opacity-55"
        />
      </div>
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover opacity-55"
      autoPlay
      muted
      loop
      playsInline
      poster={posterUrl ?? undefined}
    >
      <source src={videoUrl} />
    </video>
  );
}
