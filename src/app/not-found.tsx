import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// not-found global (route hors des groupes (site)/(admin)). Doit porter ses
// propres <html>/<body> puisqu'il n'existe pas de root layout partagé.
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-6 text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[13rem] font-light leading-none text-ink-900/[0.035] sm:text-[22rem]"
          >
            404
          </span>
          <div className="page-fade relative max-w-md">
            <p className="kicker">Erreur 404</p>
            <h1 className="mt-6 font-display text-4xl font-light italic tracking-tight text-ink-900 sm:text-5xl">
              Cette table n&apos;est pas dressée
            </h1>
            <span aria-hidden className="mx-auto mt-8 block h-px w-14 bg-gold-500/60" />
            <p className="mt-8 text-sm leading-relaxed text-ink-600">
              La page que vous cherchez n&apos;existe pas ou a été déplacée.
            </p>
            <a href="/" className="btn-cta mt-10">
              Retour à l&apos;accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
