import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ streak: 1, synced: false });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("record_daily_visit")
    .single<{ streak: number; last_visit: string }>();

  if (error) {
    return NextResponse.json({ error: "streak_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ streak: data.streak, synced: true });
}
