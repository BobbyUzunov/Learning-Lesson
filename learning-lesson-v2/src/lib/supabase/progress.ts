import { getGameProgressStats, toGameProgress } from "@/lib/game-progress";
import type { ProgressRecord } from "@/lib/types";
import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";

export async function getCurrentUserProgress(): Promise<{
  progress: ProgressRecord[];
  userEmail: string | null;
  isDemo: boolean;
  streakCount: number;
}> {
  if (!hasSupabaseEnv()) {
    const { demoProgress } = await import("@/lib/progress");
    return { progress: demoProgress, userEmail: null, isDemo: true, streakCount: 1 };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { progress: [], userEmail: null, isDemo: false, streakCount: 0 };
  }

  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase
      .from("user_progress")
      .select("lesson_id, completed, xp_earned, completed_at")
      .eq("user_id", user.id),
    supabase.from("profiles").select("streak_count").eq("id", user.id).maybeSingle()
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return {
    progress: (data ?? []) as ProgressRecord[],
    userEmail: user.email ?? null,
    isDemo: false,
    streakCount: profile?.streak_count ?? 0
  };
}

export function getSupabaseGameStats(progress: ProgressRecord[]) {
  return getGameProgressStats(toGameProgress(progress));
}
