"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Fait apparaître son contenu quand il entre dans le viewport — voir le CSS
 * `[data-reveal]` dans globals.css. Seule famille d'animation du site :
 *  - `kind="fade"` (défaut) : fondu + léger décalage vertical ;
 *  - `kind="image"` : dévoilement en rideau du bas vers le haut, l'image
 *    se posant avec un léger recul (même courbe, même lenteur).
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
      {kind === "image" ? (
        // Le rideau (clip-path) est porté par ce calque intérieur et non par
        // l'élément observé : Chrome considère un élément entièrement masqué
        // par clip-path comme « non visible », l'observer ne se déclencherait
        // jamais. L'élément parent doit être positionné (relative/absolute).
        <span data-reveal-curtain="" className="absolute inset-0 block">
          {children}
        </span>
      ) : (
        children
      )}
    </Tag>
  );
}
