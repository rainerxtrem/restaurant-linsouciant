import { describe, expect, it, vi } from "vitest";

function mockAuth(user: unknown) {
  vi.resetModules();
  vi.doMock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(user ? { user } : null) }));
}

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
});
