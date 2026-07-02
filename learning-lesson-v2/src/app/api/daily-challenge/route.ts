import { NextResponse } from "next/server";
import { getDailyChallengeStatus } from "@/lib/daily-challenge";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(getDailyChallengeStatus());
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(getDailyChallengeStatus());
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id, completed, xp_earned, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(getDailyChallengeStatus(data ?? []));
}
