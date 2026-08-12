import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdminEmailAllowed, parseAdminEmailAllowlist } from "./admin-allowlist";

describe("admin email allowlist", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats an empty allowlist as open", () => {
    expect(parseAdminEmailAllowlist("")).toEqual([]);
    expect(parseAdminEmailAllowlist("  , ")).toEqual([]);
    expect(isAdminEmailAllowed("anyone@school.bg", [])).toBe(true);
  });

  it("matches emails case-insensitively", () => {
    const allowlist = parseAdminEmailAllowlist("Admin@School.BG, other@school.bg");
    expect(allowlist).toEqual(["admin@school.bg", "other@school.bg"]);
    expect(isAdminEmailAllowed("admin@school.bg", allowlist)).toBe(true);
    expect(isAdminEmailAllowed("ADMIN@school.bg", allowlist)).toBe(true);
    expect(isAdminEmailAllowed("student@school.bg", allowlist)).toBe(false);
    expect(isAdminEmailAllowed(null, allowlist)).toBe(false);
  });
});
