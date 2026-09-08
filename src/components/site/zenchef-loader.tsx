"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * Charge le SDK de réservation Zenchef une seule fois pour tout le site
 * (identique à l'intégration de l'ancien site : script + div
 * `.zc-widget-config`). Une fois chargé, n'importe quel élément portant
 * l'attribut `data-zc-action="open"` ouvre la fenêtre de réservation.
 */
export function ZenchefLoader({ restaurantId }: { restaurantId: string }) {
  const locale = useLocale();

  useEffect(() => {
    if (!restaurantId) return;

    if (!document.querySelector(".zc-widget-config")) {
      const config = document.createElement("div");
      config.className = "zc-widget-config";
      config.setAttribute("data-restaurant", restaurantId);
      config.setAttribute("data-lang", locale);
      document.body.appendChild(config);
    }

    if (!document.getElementById("zenchef-sdk")) {
      const script = document.createElement("script");
      script.id = "zenchef-sdk";
      script.async = true;
      script.src = "https://sdk.zenchef.com/v1/sdk.min.js";
      document.body.appendChild(script);
    }
  }, [restaurantId, locale]);

  return null;
}
