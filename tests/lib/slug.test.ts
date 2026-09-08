import { describe, expect, it, vi, beforeEach } from "vitest";
import { slugifyText } from "@/lib/slug";

describe("slugifyText", () => {
  it("convertit les accents et espaces", () => {
    expect(slugifyText("L'Insouciant à Malicorne")).toBe("l-insouciant-a-malicorne");
  });

  it("gère les caractères spéciaux", () => {
    expect(slugifyText("Menu Plaisir !")).toBe("menu-plaisir");
  });
});

const { findUniqueMenu } = vi.hoisted(() => ({ findUniqueMenu: vi.fn() }));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    menu: { findUnique: findUniqueMenu },
    page: { findUnique: vi.fn() },
    galleryAlbum: { findUnique: vi.fn() },
  },
}));

describe("ensureUniqueSlug", () => {
  beforeEach(() => findUniqueMenu.mockReset());

  it("retourne le slug de base si disponible", async () => {
    findUniqueMenu.mockResolvedValue(null);
    const { ensureUniqueSlug } = await import("@/lib/slug");
    expect(await ensureUniqueSlug("menu", "Menu Plaisir")).toBe("menu-plaisir");
  });

  it("ajoute un suffixe numérique en cas de collision", async () => {
    findUniqueMenu.mockResolvedValueOnce({ id: "existing-1" }).mockResolvedValueOnce(null);
    const { ensureUniqueSlug } = await import("@/lib/slug");
    expect(await ensureUniqueSlug("menu", "Menu Plaisir")).toBe("menu-plaisir-2");
  });

  it("exclut l'enregistrement courant lors d'une modification", async () => {
    findUniqueMenu.mockResolvedValue({ id: "current-id" });
    const { ensureUniqueSlug } = await import("@/lib/slug");
    expect(await ensureUniqueSlug("menu", "Menu Plaisir", "current-id")).toBe("menu-plaisir");
  });
});
