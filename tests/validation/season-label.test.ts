import { describe, expect, it } from "vitest";
import { seasonLabelFor } from "@/lib/validation/house";

describe("seasonLabelFor", () => {
  it.each([
    ["2026-11-24", "Carte d'automne · novembre 2026", "Autumn menu · November 2026"],
    ["2026-12-01", "Carte d'hiver · décembre 2026", "Winter menu · December 2026"],
    ["2027-02-28", "Carte d'hiver · février 2027", "Winter menu · February 2027"],
    ["2027-03-01", "Carte de printemps · mars 2027", "Spring menu · March 2027"],
    ["2027-06-15", "Carte d'été · juin 2027", "Summer menu · June 2027"],
  ])("%s", (iso, fr, en) => {
    const date = new Date(`${iso}T12:00:00`);
    expect(seasonLabelFor(date, "fr")).toBe(fr);
    expect(seasonLabelFor(date, "en")).toBe(en);
  });
});
