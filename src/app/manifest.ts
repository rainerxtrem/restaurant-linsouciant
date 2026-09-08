import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_SITE_NAME ?? "L'Insouciant",
    short_name: "L'Insouciant",
    description: "Restaurant L'Insouciant — Le Mans. Gastronomie décomplexée.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#17130f",
  };
}
