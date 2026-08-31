import { NextResponse } from "next/server";
import { readJsonObject } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function userHasActiveClassrooms(userId: string) {
  const supabase = await createClient();
  const [owned, coTeacher] = await Promise.all([
    supabase.from("classrooms").select("id").eq("teacher_id", userId).limit(1),
    supabase.from("classroom_teachers").select("classroom_id").eq("user_id", userId).limit(1)
  ]);

  if (owned.error || coTeacher.error) {
    return { blocked: true, reason: "account_delete_unavailable" as const };
  }

  if ((owned.data?.length ?? 0) > 0 || (coTeacher.data?.length ?? 0) > 0) {
    return { blocked: true, reason: "teacher_has_classrooms" as const };
  }

  return { blocked: false as const };
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  if (body?.confirm !== true) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  if (profile?.role === "admin") {
    return NextResponse.json({ error: "admin_account_protected" }, { status: 403 });
  }

  if (profile?.role === "teacher") {
    const classroomCheck = await userHasActiveClassrooms(user.id);
    if (classroomCheck.blocked) {
      return NextResponse.json({ error: classroomCheck.reason }, { status: 403 });
    }
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) {
    logServerError("account_delete_failed", { userId: user.id, detail: error.message.slice(0, 200) });
    return NextResponse.json({ error: "account_delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
