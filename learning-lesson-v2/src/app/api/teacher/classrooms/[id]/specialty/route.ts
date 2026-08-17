import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SpecialtyRow = {
  id: string;
  specialty_id: string | null;
};

const updateClassroomSpecialtyErrors = [
  "not_authenticated",
  "invalid_specialty",
  "unknown_specialty",
  "classroom_not_found",
  "not_authorized"
] as const;

function updateClassroomSpecialtyErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "classroom_not_found") return 404;
  if (code === "specialty_update_failed") return 500;
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
  const specialtyId = typeof body?.specialtyId === "string" ? body.specialtyId.trim() : "";

  if (!specialtyId) {
    return NextResponse.json({ error: "invalid_specialty" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("update_classroom_specialty", {
      p_classroom_id: id,
      p_specialty_id: specialtyId
    })
    .single<SpecialtyRow>();

  if (error) {
    const code = resolvePublicErrorCode(
      error.message,
      updateClassroomSpecialtyErrors,
      "specialty_update_failed"
    );
    return NextResponse.json({ error: code }, { status: updateClassroomSpecialtyErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, specialtyId: data.specialty_id }
  });
}
