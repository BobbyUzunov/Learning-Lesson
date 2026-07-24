import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type CreateClassroomRow = {
  id: string;
  name: string;
  join_code: string;
};

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const body = await readJsonObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const specialtyId = typeof body?.specialtyId === "string" && body.specialtyId ? body.specialtyId : null;
  const gradeLevel = typeof body?.gradeLevel === "number" ? Math.trunc(body.gradeLevel) : 8;

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  if (gradeLevel < 8 || gradeLevel > 12) {
    return NextResponse.json({ error: "invalid_grade" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("create_classroom", {
      p_name: name,
      p_description: description,
      p_specialty_id: specialtyId,
      p_grade_level: gradeLevel
    })
    .single<CreateClassroomRow>();

  if (error) {
    const status = error.message.includes("teacher_required") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  revalidatePath("/teacher");

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, name: data.name, joinCode: data.join_code }
  });
}
