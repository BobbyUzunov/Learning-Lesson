import { afterEach, describe, expect, it, vi } from "vitest";
import { isE2eAuthEnabled } from "./e2e-auth";

describe("isE2eAuthEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is off when E2E_FAKE_AUTH is not set", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "");
    expect(isE2eAuthEnabled()).toBe(false);
  });

  it("is off on Vercel production even when E2E_FAKE_AUTH=1", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    vi.stubEnv("CI", "true");
    expect(isE2eAuthEnabled()).toBe(false);
  });

  it("is on for local Playwright (no Vercel env)", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    expect(isE2eAuthEnabled()).toBe(true);
  });

  it("is off on Vercel preview even with ALLOW_E2E_FAKE_AUTH=1", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    vi.stubEnv("CI", "true");
    expect(isE2eAuthEnabled()).toBe(false);
  });

  it("is off on Vercel when only VERCEL=1 is set", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    expect(isE2eAuthEnabled()).toBe(false);
  });
});

describe("parseE2eRole", () => {
  it("defaults to user and accepts teacher/admin", async () => {
    const { parseE2eRole } = await import("./e2e-auth");
    expect(parseE2eRole(undefined)).toBe("user");
    expect(parseE2eRole("teacher")).toBe("teacher");
    expect(parseE2eRole("admin")).toBe("admin");
    expect(parseE2eRole("nope")).toBe("user");
  });
});
