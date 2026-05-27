import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getLessonXp } from "@/lib/supabase/progress";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const { lessonId } = (await request.json()) as { lessonId?: string };

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      xp_earned: getLessonXp(lessonId),
      completed_at: new Date().toISOString()
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
