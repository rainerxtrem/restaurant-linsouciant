import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
const SUPER_ADMIN_ROLES: Role[] = ["SUPER_ADMIN"];
export const VOUCHER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "VOUCHER_CHECKER"];

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

/**
 * Vérification des bons cadeaux en salle (/admin/controle) : admins et
 * comptes « Contrôle des bons cadeaux ». Le compte est relu en base à chaque
 * appel : un compte de salle désactivé perd l'accès immédiatement, même si
 * sa session est encore ouverte.
 */
export async function requireVoucherAccess() {
  const session = await requireSession();
  if (!VOUCHER_ROLES.includes(session.user.role)) throw new ForbiddenError();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });
  if (!user?.isActive || !VOUCHER_ROLES.includes(user.role)) throw new ForbiddenError();
  return session;
}
