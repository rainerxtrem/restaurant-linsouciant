"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Logo du hero qui « se replie » vers l'en-tête au défilement : il rétrécit,
 * remonte et s'efface tandis que le logo de l'en-tête (SiteHeader) apparaît —
 * l'effet lit comme un morphing du grand logo vers le petit.
 */
export function HeroLogo({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 1;
      setP(Math.min(1, window.scrollY / (h * 0.65)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transform: `scale(${1 - p * 0.62}) translateY(${-p * 44}px)`,
        opacity: Math.max(0, 1 - p * 1.5),
        transition: "transform 120ms linear, opacity 120ms linear",
        willChange: "transform, opacity",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={760}
        height={350}
        priority
        className="h-auto w-[280px] sm:w-[420px] lg:w-[500px]"
      />
    </div>
  );
}
