import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type NameRow = {
  classroom_id: string;
  student_id: string;
  roster_name: string | null;
  display_name: string | null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id, studentId } = await params;
  const body = await readJsonObject(request);
  const rosterName = typeof body?.rosterName === "string" ? body.rosterName : "";

  if (rosterName.trim().length > 80) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("set_classroom_member_name", {
      p_classroom_id: id,
      p_student_id: studentId,
      p_roster_name: rosterName
    })
    .single<NameRow>();

  if (error) {
    const statusCode =
      error.message.includes("not_authorized") || error.message.includes("not_authenticated")
        ? 403
        : error.message.includes("member_not_found")
          ? 404
          : 400;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  revalidatePath(`/teacher/classes/${id}`);
  revalidatePath("/teacher/classes");

  return NextResponse.json({
    ok: true,
    member: {
      classroomId: data.classroom_id,
      studentId: data.student_id,
      rosterName: data.roster_name,
      displayName: data.display_name
    }
  });
}
