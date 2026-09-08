import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";

const intlMiddleware = createIntlMiddleware(routing);

// On combine deux middlewares :
//  - next-intl pour la négociation de langue sur le site public,
//  - NextAuth (callback `authorized` dans lib/auth/config.ts) pour protéger
//    /admin. L'admin reste monolingue (français) : pas de préfixe de locale.
export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // La redirection éventuelle vers /admin/login est déjà gérée par le
    // callback `authorized` ; ici on laisse simplement passer.
    return NextResponse.next();
  }

  return intlMiddleware(request);
});

export const config = {
  // Tout sauf : routes API, assets Next, fichiers statiques (avec extension).
  matcher: ["/((?!api|_next|_vercel|media|.*\\..*).*)"],
};
