import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type StatusRow = {
  id: string;
  status: string;
  join_code_enabled: boolean;
};

const updateClassroomStatusErrors = ["not_authenticated", "invalid_status", "not_authorized"] as const;

function updateClassroomStatusErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "status_update_failed") return 500;
  return 400;
}

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
    const code = resolvePublicErrorCode(error.message, updateClassroomStatusErrors, "status_update_failed");
    return NextResponse.json({ error: code }, { status: updateClassroomStatusErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, status: data.status, joinCodeEnabled: data.join_code_enabled }
  });
}
