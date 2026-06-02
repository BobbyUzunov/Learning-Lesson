import { lessons } from "@/lib/data";
import { getGameProgressStats, toGameProgress } from "@/lib/game-progress";
import { xpPerLesson } from "@/lib/game-data";
import type { ProgressRecord } from "@/lib/types";
import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";

export async function getCurrentUserProgress(): Promise<{
  progress: ProgressRecord[];
  userEmail: string | null;
  isDemo: boolean;
}> {
  if (!hasSupabaseEnv()) {
    const { demoProgress } = await import("@/lib/progress");
    return { progress: demoProgress, userEmail: null, isDemo: true };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { progress: [], userEmail: null, isDemo: false };
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id, completed, xp_earned, completed_at")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    progress: (data ?? []) as ProgressRecord[],
    userEmail: user.email ?? null,
    isDemo: false
  };
}

export function getLessonXp(lessonId: string) {
  return lessons.find((lesson) => lesson.id === lessonId)?.xp ?? xpPerLesson;
}

export function getSupabaseGameStats(progress: ProgressRecord[]) {
  return getGameProgressStats(toGameProgress(progress));
}
