import { afterEach, describe, expect, it, vi } from "vitest";
import { hasSupabaseDataEnv } from "./data-env";

function useRealPublicCredentials() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "real-anon-key");
}

describe("hasSupabaseDataEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows remote data with real credentials outside fake E2E", () => {
    useRealPublicCredentials();
    vi.stubEnv("E2E_FAKE_AUTH", "");

    expect(hasSupabaseDataEnv()).toBe(true);
  });

  it("isolates fake-auth browser tests from a configured remote project", () => {
    useRealPublicCredentials();
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "");

    expect(hasSupabaseDataEnv()).toBe(false);
  });

  it("never disables real production data access", () => {
    useRealPublicCredentials();
    vi.stubEnv("E2E_FAKE_AUTH", "1");
    vi.stubEnv("ALLOW_E2E_FAKE_AUTH", "1");
    vi.stubEnv("VERCEL_ENV", "production");

    expect(hasSupabaseDataEnv()).toBe(true);
  });
});
