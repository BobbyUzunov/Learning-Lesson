import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type TransferRow = {
  id: string;
  teacher_id: string;
};

const transferClassroomErrors = [
  "not_authenticated",
  "classroom_not_found",
  "not_authorized",
  "invalid_new_owner"
] as const;

function transferClassroomErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "classroom_not_found") return 404;
  if (code === "transfer_failed") return 500;
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
  const newOwnerId = typeof body?.newOwnerId === "string" ? body.newOwnerId.trim() : "";

  if (!newOwnerId) {
    return NextResponse.json({ error: "invalid_owner" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("transfer_classroom", {
      p_classroom_id: id,
      p_new_owner_id: newOwnerId
    })
    .single<TransferRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, transferClassroomErrors, "transfer_failed");
    return NextResponse.json({ error: code }, { status: transferClassroomErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, teacherId: data.teacher_id }
  });
}
