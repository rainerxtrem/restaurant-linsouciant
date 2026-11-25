import { describe, expect, it } from "vitest";
import { resolveMediaType, resolveMimeType } from "@/lib/media/limits";

describe("resolveMimeType", () => {
  it("garde le type fourni par le navigateur", () => {
    expect(resolveMimeType("image/avif", "photo.avif")).toBe("image/avif");
    expect(resolveMimeType("image/png", "logo.png")).toBe("image/png");
  });

  it("déduit le type de l'extension quand il manque", () => {
    expect(resolveMimeType("", "photo.AVIF")).toBe("image/avif");
    expect(resolveMimeType("application/octet-stream", "plat.avif")).toBe("image/avif");
  });

  it("ne rend pas acceptable une extension inconnue", () => {
    expect(resolveMediaType(resolveMimeType("", "script.exe"))).toBeNull();
  });
});

describe("resolveMediaType", () => {
  it("accepte l'AVIF comme image", () => {
    expect(resolveMediaType("image/avif")).toBe("IMAGE");
  });
});
