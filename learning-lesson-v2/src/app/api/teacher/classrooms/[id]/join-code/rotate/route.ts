import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RotateRow = {
  id: string;
  join_code: string;
};

const rotateJoinCodeErrors = ["not_authenticated", "not_authorized", "join_code_generation_failed"] as const;

function rotateJoinCodeErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "join_code_generation_failed" || code === "join_code_rotation_failed") return 500;
  return 400;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const { data, error } = await auth
    .supabase!.rpc("rotate_classroom_join_code", { p_classroom_id: id })
    .single<RotateRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, rotateJoinCodeErrors, "join_code_rotation_failed");
    return NextResponse.json({ error: code }, { status: rotateJoinCodeErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, joinCode: data.join_code }
  });
}
