import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateAssignmentRow = {
  id: string;
  classroom_id: string;
  mission_id: string;
  due_at: string | null;
  instructions: string | null;
  created_at: string;
};

const createAssignmentErrors = [
  "not_authenticated",
  "teacher_required",
  "not_authorized",
  "assignment_exists",
  "unknown_mission",
  "invalid_instructions"
] as const;

function createAssignmentErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized" || code === "teacher_required") return 403;
  if (code === "assignment_exists") return 409;
  if (code === "assignment_failed") return 500;
  return 400;
}

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id: classroomId } = await context.params;
  const body = await readJsonObject(request);
  const missionId = typeof body?.missionId === "string" ? body.missionId.trim() : "";
  const instructions = typeof body?.instructions === "string" ? body.instructions.trim() : "";
  const dueAtRaw = typeof body?.dueAt === "string" ? body.dueAt.trim() : "";
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;

  if (!missionId) {
    return NextResponse.json({ error: "invalid_mission" }, { status: 400 });
  }

  if (dueAtRaw && (Number.isNaN(dueAt?.getTime()) || !dueAt)) {
    return NextResponse.json({ error: "invalid_due_at" }, { status: 400 });
  }

  if (instructions.length > 2000) {
    return NextResponse.json({ error: "invalid_instructions" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("create_classroom_assignment", {
      p_classroom_id: classroomId,
      p_mission_id: missionId,
      p_due_at: dueAt ? dueAt.toISOString() : null,
      p_instructions: instructions
    })
    .single<CreateAssignmentRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, createAssignmentErrors, "assignment_failed");
    return NextResponse.json({ error: code }, { status: createAssignmentErrorStatus(code) });
  }

  revalidatePath(`/teacher/classes/${classroomId}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return NextResponse.json({
    ok: true,
    assignment: {
      id: data.id,
      classroomId: data.classroom_id,
      missionId: data.mission_id,
      dueAt: data.due_at,
      instructions: data.instructions,
      createdAt: data.created_at
    }
  });
}
