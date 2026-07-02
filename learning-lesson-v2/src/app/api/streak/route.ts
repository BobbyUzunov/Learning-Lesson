import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ streak: 1, synced: false });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count,last_visit")
    .eq("id", user.id)
    .maybeSingle();

  const previousCount = profile?.streak_count ?? 0;
  const previousVisit = profile?.last_visit;
  const nextCount =
    previousVisit === today ? previousCount : previousVisit === yesterdayKey ? previousCount + 1 : 1;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      streak_count: nextCount,
      last_visit: today
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ streak: nextCount, synced: true });
}
