import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SetRoleRow = {
  user_id: string;
  role: string;
};

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

  const { data, error } = await auth
    .supabase!.rpc("set_user_role", { p_user_id: id, p_role: role })
    .single<SetRoleRow>();

  if (error) {
    const status = error.message.includes("unknown_user") ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  revalidatePath("/admin/teachers");

  return NextResponse.json({ ok: true, userId: data.user_id, role: data.role });
}
