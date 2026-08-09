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
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    vi.stubEnv("CI", "true");
    expect(isE2eAuthEnabled()).toBe(false);
  });

  it("is on for local Playwright (no VERCEL_ENV)", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "");
    expect(isE2eAuthEnabled()).toBe(true);
  });

  it("is off on Vercel preview without an explicit allow switch", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("CI", "");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "");
    expect(isE2eAuthEnabled()).toBe(false);
  });

  it("is on for Vercel preview when ALLOW_E2E_FAKE_AUTH=1", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    expect(isE2eAuthEnabled()).toBe(true);
  });

  it("is on for CI on non-production Vercel envs", () => {
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("CI", "true");
    expect(isE2eAuthEnabled()).toBe(true);
  });
});
