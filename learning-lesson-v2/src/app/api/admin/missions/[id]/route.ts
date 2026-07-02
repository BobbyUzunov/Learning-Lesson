import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGameLesson } from "@/lib/game-data";
import { toMissionOverrideRow, type MissionOverrideInput } from "@/lib/mission-content";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { supabase, user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const lesson = getGameLesson(id);
  if (!lesson) {
    return NextResponse.json({ error: "Unknown mission." }, { status: 404 });
  }

  const body = (await request.json()) as MissionOverrideInput;
  const row = toMissionOverrideRow(lesson, body);
  const { error } = await auth.supabase!.from("game_missions").upsert(row, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/lesson/${id}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/missions/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/paths");

  return NextResponse.json({ ok: true, lessonId: id });
}
