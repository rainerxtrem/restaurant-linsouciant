"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Fait apparaître son contenu quand il entre dans le viewport — voir le CSS
 * `[data-reveal]` dans globals.css. Seule famille d'animation du site :
 *  - `kind="fade"` (défaut) : fondu + léger décalage vertical ;
 *  - `kind="image"` : fondu seul, sans décalage, pour les photos. Pas de
 *    masquage (clip-path) : une image masquée n'est ni « vue » par
 *    l'IntersectionObserver ni chargée par le lazy-loading du navigateur,
 *    ce qui retardait son apparition d'une à deux secondes.
 * Volontairement minimal (IntersectionObserver natif) pour ne pas ajouter de
 * dépendance juste pour une animation de scroll.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  kind = "fade",
}: {
  children: ReactNode;
  delay?: number;
  kind?: "fade" | "image";
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.setAttribute("data-reveal", "in");
          observer.disconnect();
        }
      },
      // Déclenchement dès que l'élément approche de l'écran (marge positive en
      // bas) : l'animation est déjà en cours quand il devient visible.
      { threshold: 0, rootMargin: "0px 0px 12% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-reveal-kind={kind === "image" ? "image" : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
