import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SetRoleRow = {
  user_id: string;
  role: string;
};

const setUserRoleErrors = [
  "not_authenticated",
  "admin_required",
  "invalid_role",
  "unknown_user",
  "admin_role_protected",
  "teacher_has_classrooms"
] as const;

function setUserRoleErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "admin_required") return 403;
  if (code === "unknown_user") return 404;
  if (code === "admin_role_protected" || code === "teacher_has_classrooms") return 409;
  if (code === "set_user_role_failed") return 500;
  return 400;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = await readJsonObject(request);
  const role = typeof body?.role === "string" ? body.role : "";

  if (role !== "user" && role !== "teacher") {
    return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const { data, error } = await createAdminClient()
    .rpc("set_user_role", { p_user_id: id, p_role: role, p_actor_id: auth.user.id })
    .single<SetRoleRow>();

  if (error || !data) {
    const code = resolvePublicErrorCode(error?.message ?? "", setUserRoleErrors, "set_user_role_failed");
    if (code === "set_user_role_failed") {
      logServerError("admin_set_user_role_failed", {
        userId: id,
        detail: (error?.message ?? "missing_row").slice(0, 200)
      });
    }
    return NextResponse.json({ error: code }, { status: setUserRoleErrorStatus(code) });
  }

  revalidatePath("/admin/teachers");

  return NextResponse.json({ ok: true, userId: data.user_id, role: data.role });
}
