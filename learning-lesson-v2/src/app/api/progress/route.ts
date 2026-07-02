import { NextResponse } from "next/server";
import { getGameLesson, xpPerLesson } from "@/lib/game-data";
import { getLevelProgress } from "@/lib/game-progress";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const { lessonId } = (await request.json()) as { lessonId?: string };

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  if (!getGameLesson(lessonId)) {
    return NextResponse.json({ error: "Unknown lesson." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const xpEarned = xpPerLesson;
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString()
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: completedProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("xp_earned")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const xp = (completedProgress ?? []).reduce((total, item) => total + (item.xp_earned ?? 0), 0);
  const level = getLevelProgress(xp).level;
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      xp,
      level
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, level, xp });
}
