import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Négociation de langue next-intl pour le site public uniquement.
// /admin est exclu du matcher (back-office monolingue) et sa protection est
// assurée côté serveur par le layout du tableau de bord + requireAdmin()
// sur les routes API. Ne pas envelopper ce middleware dans le wrapper
// `auth()` de NextAuth : la combinaison provoque une boucle de redirection
// `/` → `/` avec localePrefix "as-needed".
export default createIntlMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|media|.*\\..*).*)"],
};
