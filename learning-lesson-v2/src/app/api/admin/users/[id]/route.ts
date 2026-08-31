import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserDeletionBlockReason } from "@/lib/admin/user-deletion";
import { readJsonObject } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function deleteUserErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "admin_required" || code === "admin_allowlist") return 403;
  if (code === "unknown_user") return 404;
  if (
    code === "admin_account_protected" ||
    code === "teacher_has_classrooms" ||
    code === "cannot_delete_self"
  ) {
    return 409;
  }
  if (code === "account_delete_unavailable") return 503;
  if (code === "user_delete_failed") return 500;
  return 400;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  if (body?.confirm !== true) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const { id } = await params;
  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  if (!profile) {
    return NextResponse.json({ error: "unknown_user" }, { status: 404 });
  }

  const blockReason = await getUserDeletionBlockReason(auth.supabase, id, {
    actorUserId: auth.user.id,
    role: profile.role
  });

  if (blockReason) {
    return NextResponse.json({ error: blockReason }, { status: deleteUserErrorStatus(blockReason) });
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) {
    logServerError("admin_delete_user_failed", { userId: id, detail: error.message.slice(0, 200) });
    return NextResponse.json({ error: "user_delete_failed" }, { status: 500 });
  }

  revalidatePath("/admin/teachers");

  return NextResponse.json({ ok: true, userId: id });
}
