import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type CreateClassroomRow = {
  id: string;
  name: string;
  join_code: string;
};

const createClassroomErrors = [
  "not_authenticated",
  "teacher_required",
  "invalid_name",
  "invalid_description",
  "invalid_grade",
  "invalid_academic_year",
  "unknown_specialty",
  "invalid_specialty",
  "join_code_generation_failed"
] as const;

function createClassroomErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "teacher_required") return 403;
  if (code === "join_code_generation_failed" || code === "classroom_failed") return 500;
  return 400;
}

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
  const academicYear =
    typeof body?.academicYear === "string" && body.academicYear.trim()
      ? body.academicYear.trim()
      : "2026/2027";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  if (!specialtyId) {
    return NextResponse.json({ error: "invalid_specialty" }, { status: 400 });
  }

  if (gradeLevel < 8 || gradeLevel > 12) {
    return NextResponse.json({ error: "invalid_grade" }, { status: 400 });
  }

  if (!/^\d{4}\/\d{4}$/.test(academicYear)) {
    return NextResponse.json({ error: "invalid_academic_year" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("create_classroom", {
      p_name: name,
      p_description: description,
      p_specialty_id: specialtyId,
      p_grade_level: gradeLevel,
      p_academic_year: academicYear
    })
    .single<CreateClassroomRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, createClassroomErrors, "classroom_failed");
    return NextResponse.json({ error: code }, { status: createClassroomErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, name: data.name, joinCode: data.join_code }
  });
}
