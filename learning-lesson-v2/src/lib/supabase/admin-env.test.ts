import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSupabaseAdminEnv, hasSupabaseAdminEnv } from "./admin-env";

describe("Supabase admin environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers SUPABASE_SECRET_KEY over the legacy service-role alias", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_primary");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-service-role-key");

    expect(getSupabaseAdminEnv()).toEqual({
      url: "https://example.supabase.co",
      secretKey: "sb_secret_primary"
    });
  });

  it("accepts SUPABASE_SERVICE_ROLE_KEY as a backwards-compatible fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-service-role-key");

    expect(hasSupabaseAdminEnv()).toBe(true);
    expect(getSupabaseAdminEnv().secretKey).toBe("legacy-service-role-key");
  });

  it("fails closed without a server credential and never includes env values in the error", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://sensitive-project.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(hasSupabaseAdminEnv()).toBe(false);
    expect(() => getSupabaseAdminEnv()).toThrow("Missing server-side Supabase configuration");
    expect(() => getSupabaseAdminEnv()).not.toThrow("sensitive-project");
  });
});
