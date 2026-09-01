import { describe, expect, it } from "vitest";
import { isAccountDeletePhrase } from "./delete-confirmation";

describe("isAccountDeletePhrase", () => {
  it("accepts the English and Bulgarian confirmation phrases", () => {
    expect(isAccountDeletePhrase("DELETE")).toBe(true);
    expect(isAccountDeletePhrase(" delete ")).toBe(true);
    expect(isAccountDeletePhrase("ИЗТРИЙ")).toBe(true);
    expect(isAccountDeletePhrase("изтрий")).toBe(true);
  });

  it("rejects missing or unrelated confirmation text", () => {
    expect(isAccountDeletePhrase(true)).toBe(false);
    expect(isAccountDeletePhrase("")).toBe(false);
    expect(isAccountDeletePhrase("YES")).toBe(false);
  });
});
