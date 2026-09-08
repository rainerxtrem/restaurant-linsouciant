import "./globals.css";

// not-found global (route hors des groupes (site)/(admin)). Doit porter ses
// propres <html>/<body> puisqu'il n'existe pas de root layout partagé.
export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center bg-cream-50 p-8 text-center">
          <div>
            <p className="font-display text-5xl text-gold-400">404</p>
            <p className="mt-3 text-ink-700">Page introuvable.</p>
            <a href="/" className="btn-cta mt-6">
              Accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
