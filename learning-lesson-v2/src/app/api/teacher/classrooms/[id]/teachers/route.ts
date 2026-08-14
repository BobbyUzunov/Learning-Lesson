import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AddCoTeacherRow = {
  user_id: string;
  role: string;
};

const addCoTeacherErrors = [
  "not_authenticated",
  "classroom_not_found",
  "not_authorized",
  "invalid_co_teacher",
  "already_classroom_teacher"
] as const;

function addCoTeacherErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "classroom_not_found") return 404;
  if (code === "add_co_teacher_failed") return 500;
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
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

  if (!userId) {
    return NextResponse.json({ error: "invalid_co_teacher" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("add_classroom_co_teacher", {
      p_classroom_id: id,
      p_user_id: userId
    })
    .single<AddCoTeacherRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, addCoTeacherErrors, "add_co_teacher_failed");
    return NextResponse.json({ error: code }, { status: addCoTeacherErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    teacher: { userId: data.user_id, role: data.role }
  });
}
