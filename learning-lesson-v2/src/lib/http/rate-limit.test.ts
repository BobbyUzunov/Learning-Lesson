import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isE2eAuthEnabled: vi.fn(() => false),
  hasSupabaseAdminEnv: vi.fn(() => false),
  rpc: vi.fn()
}));

vi.mock("@/lib/supabase/e2e-auth", () => ({
  isE2eAuthEnabled: mocks.isE2eAuthEnabled
}));

vi.mock("@/lib/supabase/admin-env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: mocks.rpc })
}));

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.isE2eAuthEnabled.mockReturnValue(false);
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows e2e traffic without counting", async () => {
    mocks.isE2eAuthEnabled.mockReturnValue(true);
    const { consumeRateLimit } = await import("./rate-limit");

    expect(await consumeRateLimit("bucket", { max: 1, windowSeconds: 60 })).toBe(true);
    expect(await consumeRateLimit("bucket", { max: 1, windowSeconds: 60 })).toBe(true);
  });

  it("uses the database bucket when admin env is configured", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
    mocks.rpc.mockResolvedValueOnce({ data: false, error: null });

    const { consumeRateLimit } = await import("./rate-limit");

    expect(await consumeRateLimit("kc-grade:abc", { max: 20, windowSeconds: 60 })).toBe(true);
    expect(await consumeRateLimit("kc-grade:abc", { max: 20, windowSeconds: 60 })).toBe(false);
    expect(mocks.rpc).toHaveBeenCalledWith("consume_http_rate_limit", {
      p_bucket_key: "kc-grade:abc",
      p_max_events: 20,
      p_window_seconds: 60
    });
  });

  it("falls back to in-memory limits locally", async () => {
    vi.useFakeTimers();
    const { consumeRateLimit } = await import("./rate-limit");

    expect(await consumeRateLimit("local-bucket", { max: 2, windowSeconds: 60 })).toBe(true);
    expect(await consumeRateLimit("local-bucket", { max: 2, windowSeconds: 60 })).toBe(true);
    expect(await consumeRateLimit("local-bucket", { max: 2, windowSeconds: 60 })).toBe(false);

    vi.advanceTimersByTime(61_000);

    expect(await consumeRateLimit("local-bucket", { max: 2, windowSeconds: 60 })).toBe(true);
  });
});
