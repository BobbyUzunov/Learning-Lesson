import { afterEach, describe, expect, it, vi } from "vitest";
import { assertProductionEnv } from "./production-check";

describe("assertProductionEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is a no-op outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    expect(() => assertProductionEnv()).not.toThrow();
  });

  it("requires admin secret key in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("E2E_FAKE_AUTH", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("ADMIN_EMAIL_ALLOWLIST", "admin@school.bg");

    expect(() => assertProductionEnv()).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it("requires admin allowlist in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("E2E_FAKE_AUTH", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.stubEnv("ADMIN_EMAIL_ALLOWLIST", "");

    expect(() => assertProductionEnv()).toThrow(/ADMIN_EMAIL_ALLOWLIST/);
  });

  it("rejects E2E_FAKE_AUTH in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.stubEnv("ADMIN_EMAIL_ALLOWLIST", "admin@school.bg");

    expect(() => assertProductionEnv()).toThrow(/E2E_FAKE_AUTH/);
  });

  it("passes when production env is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("E2E_FAKE_AUTH", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.stubEnv("ADMIN_EMAIL_ALLOWLIST", "admin@school.bg");

    expect(() => assertProductionEnv()).not.toThrow();
  });
});
