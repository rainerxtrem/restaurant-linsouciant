import { describe, expect, it, vi } from "vitest";

function mockAuth(user: unknown, dbUser: unknown = { isActive: true, role: (user as { role?: string })?.role }) {
  vi.resetModules();
  vi.doMock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(user ? { user } : null) }));
  vi.doMock("@/lib/db/prisma", () => ({
    prisma: { user: { findUnique: vi.fn().mockResolvedValue(dbUser) } },
  }));
}

const checker = { id: "2", role: "VOUCHER_CHECKER", email: "salle@a.fr", name: "Salle" };

describe("permissions", () => {
  it("requireAdmin autorise ADMIN et SUPER_ADMIN", async () => {
    mockAuth({ id: "1", role: "ADMIN", email: "a@a.fr", name: "A" });
    const { requireAdmin } = await import("@/lib/auth/permissions");
    await expect(requireAdmin()).resolves.toBeDefined();
  });

  it("requireSuperAdmin rejette un compte ADMIN simple", async () => {
    mockAuth({ id: "1", role: "ADMIN", email: "a@a.fr", name: "A" });
    const { requireSuperAdmin, ForbiddenError } = await import("@/lib/auth/permissions");
    await expect(requireSuperAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requireSuperAdmin autorise SUPER_ADMIN", async () => {
    mockAuth({ id: "1", role: "SUPER_ADMIN", email: "a@a.fr", name: "A" });
    const { requireSuperAdmin } = await import("@/lib/auth/permissions");
    await expect(requireSuperAdmin()).resolves.toBeDefined();
  });

  it("requireSession rejette un visiteur non authentifié", async () => {
    mockAuth(null);
    const { requireSession, UnauthorizedError } = await import("@/lib/auth/permissions");
    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("le compte de salle n'a pas accès au CMS", async () => {
    mockAuth(checker);
    const { requireAdmin, ForbiddenError } = await import("@/lib/auth/permissions");
    await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("le compte de salle peut vérifier les bons", async () => {
    mockAuth(checker);
    const { requireVoucherAccess } = await import("@/lib/auth/permissions");
    await expect(requireVoucherAccess()).resolves.toBeDefined();
  });

  it("un compte de salle désactivé perd l'accès même avec une session ouverte", async () => {
    mockAuth(checker, { isActive: false, role: "VOUCHER_CHECKER" });
    const { requireVoucherAccess, ForbiddenError } = await import("@/lib/auth/permissions");
    await expect(requireVoucherAccess()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("les administrateurs peuvent aussi vérifier les bons", async () => {
    mockAuth({ id: "1", role: "ADMIN", email: "a@a.fr", name: "A" });
    const { requireVoucherAccess } = await import("@/lib/auth/permissions");
    await expect(requireVoucherAccess()).resolves.toBeDefined();
  });
});
