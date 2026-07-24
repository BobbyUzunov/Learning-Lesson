import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RotateRow = {
  id: string;
  join_code: string;
};

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
    const statusCode = error.message.includes("not_authorized") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  revalidatePath("/teacher");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, joinCode: data.join_code }
  });
}
