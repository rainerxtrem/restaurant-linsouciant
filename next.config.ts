import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // pdfkit lit ses métriques de polices standard (.afm) via fs à
  // l'exécution, avec un chemin non statiquement analysable par le
  // file-tracer de Next — sans ceci, le dossier est absent du build
  // standalone et la génération de PDF (bons cadeaux) échoue en prod.
  outputFileTracingIncludes: {
    "/api/webhooks/stripe": ["./node_modules/pdfkit/js/data/**"],
    "/api/admin/gift-vouchers/[id]/pdf": ["./node_modules/pdfkit/js/data/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
