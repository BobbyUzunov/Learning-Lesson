import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type StatusRow = {
  id: string;
  status: string;
  join_code_enabled: boolean;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = await readJsonObject(request);
  const status = typeof body?.status === "string" ? body.status : "";

  if (status !== "active" && status !== "archived") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("update_classroom_status", {
      p_classroom_id: id,
      p_status: status
    })
    .single<StatusRow>();

  if (error) {
    const statusCode = error.message.includes("not_authorized") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  revalidatePath("/teacher");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, status: data.status, joinCodeEnabled: data.join_code_enabled }
  });
}
