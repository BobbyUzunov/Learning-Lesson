import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RemoveCoTeacherRow = {
  user_id: string;
  removed: boolean;
};

const removeCoTeacherErrors = [
  "not_authenticated",
  "classroom_not_found",
  "not_authorized",
  "invalid_co_teacher",
  "cannot_remove_owner"
] as const;

function removeCoTeacherErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "classroom_not_found") return 404;
  if (code === "remove_co_teacher_failed") return 500;
  return 400;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id, userId } = await params;
  const trimmedUserId = userId.trim();

  if (!trimmedUserId) {
    return NextResponse.json({ error: "invalid_co_teacher" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("remove_classroom_co_teacher", {
      p_classroom_id: id,
      p_user_id: trimmedUserId
    })
    .single<RemoveCoTeacherRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, removeCoTeacherErrors, "remove_co_teacher_failed");
    return NextResponse.json({ error: code }, { status: removeCoTeacherErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    teacher: { userId: data.user_id, removed: data.removed }
  });
}
