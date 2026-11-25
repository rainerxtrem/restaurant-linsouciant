import { describe, expect, it } from "vitest";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import { SITE_PAGES, allFields, type TextField } from "@/lib/content/pages";

function lookup(messages: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown> | undefined)?.[k], messages);
}

describe("registre du contenu des pages", () => {
  it.each(SITE_PAGES.map((p) => [p.key, p] as const))("%s : clés de champ uniques", (_key, page) => {
    const keys = allFields(page).map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("chaque texte par défaut existe en français et en anglais", () => {
    const missing: string[] = [];
    for (const page of SITE_PAGES) {
      for (const f of allFields(page)) {
        if (f.type !== "text" && f.type !== "textarea") continue;
        const def = (f as TextField).default;
        if (!def) continue;
        if ("msg" in def) {
          if (typeof lookup(fr, def.msg) !== "string") missing.push(`fr:${def.msg}`);
          if (typeof lookup(en, def.msg) !== "string") missing.push(`en:${def.msg}`);
        } else if (!def.fr || !def.en) {
          missing.push(`${page.key}.${f.key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("un champ sans réglage associé a toujours un texte par défaut", () => {
    const orphans = SITE_PAGES.flatMap((p) =>
      allFields(p)
        .filter((f) => (f.type === "text" || f.type === "textarea") && !(f as TextField).setting && !(f as TextField).default)
        .map((f) => `${p.key}.${f.key}`)
    );
    expect(orphans).toEqual([]);
  });
});
