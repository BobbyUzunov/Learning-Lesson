import { NextResponse } from "next/server";
import { getKnownErrorCode, readJsonObject } from "@/lib/http";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  const lessonIds = body?.lessonIds;
  if (
    !Array.isArray(lessonIds) ||
    lessonIds.length > 1 ||
    lessonIds.some((id) => typeof id !== "string" || id.length < 1 || id.length > 100)
  ) {
    return NextResponse.json({ error: "invalid_guest_progress" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("merge_guest_progress", { p_lesson_ids: lessonIds })
    .single<{ ok: boolean; xp: number; level: number }>();

  if (error) {
    const code = getKnownErrorCode(error.message, ["invalid_guest_progress"]) ?? "guest_merge_failed";
    return NextResponse.json({ error: code }, { status: code === "invalid_guest_progress" ? 400 : 500 });
  }

  return NextResponse.json(data);
}
