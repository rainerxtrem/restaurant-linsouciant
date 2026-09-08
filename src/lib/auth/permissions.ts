import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
const SUPER_ADMIN_ROLES: Role[] = ["SUPER_ADMIN"];

export class UnauthorizedError extends Error {
  constructor(message = "Authentification requise") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Permissions insuffisantes") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}

/** CMS : menus, photos, pages, messages, bons cadeaux, newsletter, réglages. */
export async function requireAdmin() {
  const session = await requireSession();
  if (!ADMIN_ROLES.includes(session.user.role)) throw new ForbiddenError();
  return session;
}

/** Gestion des comptes administrateurs uniquement. */
export async function requireSuperAdmin() {
  const session = await requireSession();
  if (!SUPER_ADMIN_ROLES.includes(session.user.role)) throw new ForbiddenError();
  return session;
}
