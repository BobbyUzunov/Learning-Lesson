import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

describe("Supabase public environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a real project URL and anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://project-ref.supabase.co/ ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", " real-anon-key ");

    expect(hasSupabaseEnv()).toBe(true);
    expect(getSupabaseEnv()).toEqual({
      url: "https://project-ref.supabase.co/",
      anonKey: "real-anon-key"
    });
  });

  it.each([
    ["https://example.supabase.co", "example-anon-key"],
    ["https://your-project.supabase.co", "your-anon-key"]
  ])("rejects documented placeholder credentials", (url, anonKey) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);

    expect(hasSupabaseEnv()).toBe(false);
    expect(() => getSupabaseEnv()).toThrow(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  });

  it("requires both values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project-ref.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(hasSupabaseEnv()).toBe(false);
  });
});
