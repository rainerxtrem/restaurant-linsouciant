import type { getEnabledThemePageBySlug } from "@/lib/services/theme-page.service";

export type ThemePageFull = NonNullable<Awaited<ReturnType<typeof getEnabledThemePageBySlug>>>;

export function euro(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Paragraphes séparés par une ligne vide, retours à la ligne conservés. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className}>
            {p.split("\n").map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        ))}
    </>
  );
}
