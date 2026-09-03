import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { isE2eAuthEnabled } from "@/lib/supabase/e2e-auth";

type RateLimitOptions = {
  max?: number;
  windowSeconds?: number;
};

type BucketState = {
  timestamps: number[];
};

export type RateLimitDecision = "allowed" | "limited" | "unavailable";

const inMemoryBuckets = new Map<string, BucketState>();

function consumeInMemoryRateLimit(bucket: string, max: number, windowSeconds: number): RateLimitDecision {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const state = inMemoryBuckets.get(bucket) ?? { timestamps: [] };
  state.timestamps = state.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (state.timestamps.length >= max) {
    inMemoryBuckets.set(bucket, state);
    return "limited";
  }

  state.timestamps.push(now);
  inMemoryBuckets.set(bucket, state);
  return "allowed";
}

/** Returns whether the request is allowed, rate limited, or the limiter backend failed. */
export async function consumeRateLimit(
  bucket: string,
  options: RateLimitOptions = {}
): Promise<RateLimitDecision> {
  const max = options.max ?? 30;
  const windowSeconds = options.windowSeconds ?? 60;

  if (isE2eAuthEnabled()) {
    return "allowed";
  }

  if (hasSupabaseAdminEnv()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { data, error } = await createAdminClient().rpc("consume_http_rate_limit", {
      p_bucket_key: bucket,
      p_max_events: max,
      p_window_seconds: windowSeconds
    });

    if (error) {
      return "unavailable";
    }

    return data === true ? "allowed" : "limited";
  }

  return consumeInMemoryRateLimit(bucket, max, windowSeconds);
}
