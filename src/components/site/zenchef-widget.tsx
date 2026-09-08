"use client";

import { useEffect, useRef } from "react";

/**
 * Widget de réservation Zenchef. Zenchef fournit un script global
 * (`sdk.zenchef.com`) qui « hydrate » un conteneur portant l'attribut
 * `id="zc-widget"` avec `data-restaurant`. Si le script ne se charge pas
 * (bloqueur, hors-ligne…), le lien de repli reste affiché en dessous.
 */
export function ZenchefWidget({ restaurantId }: { restaurantId: string }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const script = document.createElement("script");
    script.src = "https://sdk.zenchef.com/v1/sdk.min.js";
    script.async = true;
    script.setAttribute("data-open", "false");
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="zc-widget"
      data-restaurant={restaurantId}
      data-widget-type="inline"
      className="min-h-[420px] w-full rounded-md border border-ink-100 bg-white p-2"
    />
  );
}
