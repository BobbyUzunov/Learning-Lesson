import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAdminAllowlistRequired,
  isAdminEmailAllowed,
  parseAdminEmailAllowlist
} from "./admin-allowlist";

describe("admin email allowlist", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats an empty allowlist as open outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    expect(parseAdminEmailAllowlist("")).toEqual([]);
    expect(isAdminAllowlistRequired()).toBe(false);
    expect(isAdminEmailAllowed("anyone@school.bg", [])).toBe(true);
  });

  it("requires an allowlist in production when it would otherwise be open", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isAdminAllowlistRequired()).toBe(true);
    expect(isAdminEmailAllowed("anyone@school.bg", [])).toBe(false);
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
