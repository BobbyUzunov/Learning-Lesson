import type { ProgressRecord } from "@/lib/types";
import { hasE2eAuthCookie } from "./e2e-auth";
import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";
import { getCurrentSession } from "./auth";

export async function getCurrentUserProgress(): Promise<{
  progress: ProgressRecord[];
  userEmail: string | null;
  isDemo: boolean;
  streakCount: number;
}> {
  if (await hasE2eAuthCookie()) {
    return { progress: [], userEmail: "e2e@test.local", isDemo: false, streakCount: 0 };
  }

  if (!hasSupabaseEnv()) {
    const { demoProgress } = await import("@/lib/progress");
    return { progress: demoProgress, userEmail: null, isDemo: true, streakCount: 1 };
  }

  const session = await getCurrentSession();
  if (!session.user) {
    return { progress: [], userEmail: null, isDemo: false, streakCount: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id, completed, xp_earned, completed_at")
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    progress: (data ?? []) as ProgressRecord[],
    userEmail: session.user.email ?? null,
    isDemo: false,
    streakCount: session.profile?.streak_count ?? 0
  };
}
