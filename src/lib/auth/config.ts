import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

/**
 * Config « edge-safe » : ne référence ni Prisma ni bcrypt à l'exécution
 * (indisponibles en runtime Edge) — seul un `import type` de `Role` est
 * utilisé, supprimé à la compilation. Utilisée par le middleware pour
 * protéger /admin sans toucher la base ; la config complète (provider
 * Credentials) vit dans lib/auth/index.ts et réutilise ces mêmes callbacks.
 */
export const authConfig: NextAuthConfig = {
  // Railway (proxy inconnu d'Auth.js) doit être explicitement approuvé,
  // sinon toutes les requêtes /api/auth/* échouent avec « UntrustedHost ».
  trustHost: true,
  pages: { signIn: "/admin/login" },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
      if (isAdminRoute) {
        const role = auth?.user?.role;
        if (!auth?.user || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      }
      return true;
    },
  },
};
