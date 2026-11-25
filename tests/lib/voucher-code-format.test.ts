import { describe, expect, it } from "vitest";
import { normalizeVoucherCode } from "@/lib/voucher-code-format";

describe("normalizeVoucherCode", () => {
  it.each([
    ["LINS-7F3K-QX9M", "LINS-7F3K-QX9M"],
    ["lins 7f3k qx9m", "LINS-7F3K-QX9M"],
    ["7F3KQX9M", "LINS-7F3K-QX9M"],
    ["  LINS7F3K-qx9m ", "LINS-7F3K-QX9M"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeVoucherCode(input)).toBe(expected);
  });

  it("laisse un code d'un autre format en majuscules", () => {
    expect(normalizeVoucherCode(" abc ")).toBe("ABC");
  });
});
