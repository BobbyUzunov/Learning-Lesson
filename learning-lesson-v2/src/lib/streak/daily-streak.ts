import type { SupabaseClient } from "@supabase/supabase-js";
import { logServerError } from "@/lib/observability";

/**
 * Daily streak rules.
 *
 * The source of truth is the `record_daily_visit` database function, which uses
 * the UTC calendar date (`timezone('utc', now())::date`) as the day boundary.
 * A learner's streak therefore rolls over at 00:00 UTC regardless of their
 * local timezone (02:00/03:00 in Bulgaria). The rules are:
 * - same UTC day as `last_visit`: streak unchanged (idempotent),
 * - the day after `last_visit`: streak + 1,
 * - anything else (missed a day, or first activity): streak resets to 1.
 *
 * `nextStreakCount` mirrors those rules in TypeScript so they are documented and
 * unit-tested next to the callers; keep it in sync with the SQL function.
 */
export function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function nextStreakCount(
  previous: { streak: number; lastVisit: string | null },
  today: Date = new Date()
) {
  const todayKey = utcDateKey(today);
  if (previous.lastVisit === todayKey) {
    return previous.streak;
  }

  const yesterday = new Date(`${todayKey}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return previous.lastVisit === utcDateKey(yesterday) ? previous.streak + 1 : 1;
}

export type DailyStreakResult = { streak: number; lastVisit: string };

/**
 * Records learning activity for today (UTC) for the authenticated user.
 * Idempotent within a UTC day. Returns `null` on any failure (including an
 * unauthenticated client) so callers can use it as a best-effort side effect
 * of a primary learning action without ever failing that action.
 */
export async function touchDailyStreak(
  supabase: Pick<SupabaseClient, "rpc">
): Promise<DailyStreakResult | null> {
  try {
    const { data, error } = await supabase
      .rpc("record_daily_visit")
      .single<{ streak: number; last_visit: string }>();

    if (error || !data) {
      if (error) {
        logServerError("touch_daily_streak_failed", { detail: error.message.slice(0, 200) });
      }
      return null;
    }

    return { streak: data.streak, lastVisit: data.last_visit };
  } catch (error) {
    logServerError("touch_daily_streak_failed", {
      detail: error instanceof Error ? error.message.slice(0, 200) : "unknown"
    });
    return null;
  }
}
