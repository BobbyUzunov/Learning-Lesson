import { describe, expect, it } from "vitest";
import { isValidDisplayName, sanitizeDisplayName } from "./display-name";

describe("display name validation", () => {
  it("accepts common Bulgarian and Latin names", () => {
    expect(isValidDisplayName("Иван Петров")).toBe(true);
    expect(isValidDisplayName("Maria Ivanova")).toBe(true);
    expect(isValidDisplayName("O'Brien")).toBe(true);
    expect(isValidDisplayName("Анна-Мария")).toBe(true);
  });

  it("rejects HTML and script injection payloads", () => {
    expect(isValidDisplayName("<img src=x onerror=alert('xss')>")).toBe(false);
    expect(isValidDisplayName("javascript:alert(1)")).toBe(false);
    expect(isValidDisplayName("Иван <script>")).toBe(false);
  });

  it("rejects empty, whitespace-only, and overlong names", () => {
    expect(isValidDisplayName("")).toBe(false);
    expect(isValidDisplayName("   ")).toBe(false);
    expect(isValidDisplayName("a".repeat(81))).toBe(false);
  });

  it("sanitizes to null for unsafe values", () => {
    expect(sanitizeDisplayName("  Иван  ")).toBe("Иван");
    expect(sanitizeDisplayName("<img src=x>")).toBeNull();
    expect(sanitizeDisplayName(null)).toBeNull();
  });
});
