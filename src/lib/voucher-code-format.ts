/**
 * Remet en forme un code de bon cadeau saisi à la main en salle :
 * « lins 7f3k qx9m », « 7F3KQX9M », « LINS7F3K-QX9M » → « LINS-7F3K-QX9M ».
 * Un code qui ne ressemble pas au format est simplement mis en majuscules.
 */
export function normalizeVoucherCode(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("LINS") ? compact.slice(4) : compact;
  if (body.length === 8) return `LINS-${body.slice(0, 4)}-${body.slice(4)}`;
  return input.trim().toUpperCase();
}
