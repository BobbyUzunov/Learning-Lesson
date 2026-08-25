import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { parseCustomQuestions, parseCustomTitle } from "@/lib/assignments/custom";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateAssignmentRow = {
  id: string;
  classroom_id: string;
  mission_id: string | null;
  title_override?: string | null;
  custom_questions?: unknown;
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
  "invalid_instructions",
  "invalid_title",
  "invalid_questions"
] as const;

function createAssignmentErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized" || code === "teacher_required") return 403;
  if (code === "assignment_exists") return 409;
  if (code === "assignment_failed") return 500;
  return 400;
}

function jsonError(code: string) {
  return NextResponse.json({ error: code }, { status: createAssignmentErrorStatus(code) });
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
  const instructions = typeof body?.instructions === "string" ? body.instructions.trim() : "";
  const dueAtRaw = typeof body?.dueAt === "string" ? body.dueAt.trim() : "";
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;

  if (dueAtRaw && (Number.isNaN(dueAt?.getTime()) || !dueAt)) {
    return jsonError("invalid_due_at");
  }

  if (instructions.length > 2000) {
    return jsonError("invalid_instructions");
  }

  const dueAtValue = dueAt ? dueAt.toISOString() : null;

  const isCustom = Array.isArray(body?.questions);
  let rpcCall;

  if (isCustom) {
    const title = parseCustomTitle(body?.title);
    const questions = parseCustomQuestions(body?.questions);
    if (!title) {
      return jsonError("invalid_title");
    }
    if (!questions) {
      return jsonError("invalid_questions");
    }

    rpcCall = auth.supabase!.rpc("create_custom_classroom_assignment", {
      p_classroom_id: classroomId,
      p_title: title,
      p_questions: questions,
      p_due_at: dueAtValue,
      p_instructions: instructions
    });
  } else {
    const missionId = typeof body?.missionId === "string" ? body.missionId.trim() : "";
    if (!missionId) {
      return jsonError("invalid_mission");
    }

    rpcCall = auth.supabase!.rpc("create_classroom_assignment", {
      p_classroom_id: classroomId,
      p_mission_id: missionId,
      p_due_at: dueAtValue,
      p_instructions: instructions
    });
  }

  const { data, error } = await rpcCall.single<CreateAssignmentRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, createAssignmentErrors, "assignment_failed");
    return jsonError(code);
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
      titleOverride: data.title_override ?? null,
      customQuestions: Array.isArray(data.custom_questions) ? data.custom_questions : [],
      dueAt: data.due_at,
      instructions: data.instructions,
      createdAt: data.created_at
    }
  });
}
