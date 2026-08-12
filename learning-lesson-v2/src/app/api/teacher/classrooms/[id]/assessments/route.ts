import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { AssessmentType } from "@/lib/assessments/types";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AssessmentQuestionInput = {
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
  points: number;
};

type CreateAssessmentRow = {
  id: string;
  classroom_id: string;
  title: string;
  assessment_type: string;
  status: string;
  due_at: string | null;
  duration_minutes: number | null;
  created_at: string;
};

const createAssessmentErrors = [
  "not_authenticated",
  "not_authorized",
  "invalid_title",
  "invalid_description",
  "invalid_assessment_type",
  "invalid_duration",
  "invalid_questions",
  "invalid_question_prompt",
  "invalid_question_options",
  "invalid_question",
  "invalid_correct_option",
  "invalid_points",
  "invalid_explanation"
] as const;

function createAssessmentErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "assessment_failed") return 500;
  return 400;
}

function assessmentType(value: unknown): AssessmentType | null {
  return value === "diagnostic" || value === "formative" || value === "summative" ? value : null;
}

function questionInput(value: unknown): AssessmentQuestionInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const prompt = typeof source.prompt === "string" ? source.prompt.trim() : "";
  const options = Array.isArray(source.options)
    ? source.options.map((option) => (typeof option === "string" ? option.trim() : ""))
    : [];
  const correctOption = source.correctOption;
  const points = source.points;
  const explanation = typeof source.explanation === "string" ? source.explanation.trim() : "";

  if (
    prompt.length < 3 ||
    prompt.length > 1000 ||
    options.length < 2 ||
    options.length > 6 ||
    options.some((option) => !option || option.length > 500) ||
    !Number.isInteger(correctOption) ||
    (correctOption as number) < 0 ||
    (correctOption as number) >= options.length ||
    !Number.isInteger(points) ||
    (points as number) < 1 ||
    (points as number) > 100 ||
    explanation.length > 2000
  ) {
    return null;
  }

  return {
    prompt,
    options,
    correctOption: correctOption as number,
    explanation,
    points: points as number
  };
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
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const type = assessmentType(body?.type);
  const dueAtRaw = typeof body?.dueAt === "string" ? body.dueAt.trim() : "";
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  const durationMinutes = body?.durationMinutes === null ? null : Number(body?.durationMinutes);
  const questions = Array.isArray(body?.questions) ? body.questions.map(questionInput) : [];

  if (title.length < 3 || title.length > 200) {
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  }
  if (description.length > 2000) {
    return NextResponse.json({ error: "invalid_description" }, { status: 400 });
  }
  if (!type) {
    return NextResponse.json({ error: "invalid_assessment_type" }, { status: 400 });
  }
  if (dueAtRaw && (!dueAt || Number.isNaN(dueAt.getTime()))) {
    return NextResponse.json({ error: "invalid_due_at" }, { status: 400 });
  }
  if (
    durationMinutes !== null &&
    (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 180)
  ) {
    return NextResponse.json({ error: "invalid_duration" }, { status: 400 });
  }
  if (questions.length < 2 || questions.length > 30 || questions.some((question) => !question)) {
    return NextResponse.json({ error: "invalid_questions" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("create_classroom_assessment", {
      p_classroom_id: classroomId,
      p_title: title,
      p_description: description,
      p_assessment_type: type,
      p_due_at: dueAt?.toISOString() ?? null,
      p_duration_minutes: durationMinutes,
      p_questions: questions
    })
    .single<CreateAssessmentRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, createAssessmentErrors, "assessment_failed");
    return NextResponse.json({ error: code }, { status: createAssessmentErrorStatus(code) });
  }

  revalidatePath(`/teacher/classes/${classroomId}`);
  revalidatePath(`/teacher/classes/${classroomId}/assessments`);
  revalidatePath("/teacher/assessments");
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return NextResponse.json({
    ok: true,
    assessment: {
      id: data.id,
      classroomId: data.classroom_id,
      title: data.title,
      type: data.assessment_type,
      status: data.status,
      dueAt: data.due_at,
      durationMinutes: data.duration_minutes,
      createdAt: data.created_at
    }
  });
}
