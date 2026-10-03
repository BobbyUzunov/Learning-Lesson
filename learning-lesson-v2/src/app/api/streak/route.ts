import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { touchDailyStreak } from "@/lib/streak/daily-streak";

export async function POST() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ streak: 1, synced: false });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  // Day boundary is the UTC date; same-day calls are idempotent (see touchDailyStreak).
  const result = await touchDailyStreak(supabase);
  if (!result) {
    return NextResponse.json({ error: "streak_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ streak: result.streak, synced: true });
}
