import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SubmitAssessmentRow = {
  id: string;
  assessment_id: string;
  score: number;
  max_score: number;
  percentage: number | string;
  submitted_at: string;
};

const submitAssessmentErrors = [
  "not_authorized",
  "assessment_not_found",
  "attempt_exists",
  "assessment_closed",
  "invalid_answers"
] as const;

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { id: assessmentId } = await context.params;
  const body = await readJsonObject(request);
  const answersValue = body?.answers;

  if (!answersValue || typeof answersValue !== "object" || Array.isArray(answersValue)) {
    return NextResponse.json({ error: "invalid_answers" }, { status: 400 });
  }

  const answers = Object.fromEntries(
    Object.entries(answersValue).filter(
      ([questionId, option]) => questionId.length > 0 && Number.isInteger(option) && (option as number) >= 0
    )
  );
  if (Object.keys(answers).length !== Object.keys(answersValue).length) {
    return NextResponse.json({ error: "invalid_answers" }, { status: 400 });
  }

  const { data, error } = await supabase
    .rpc("submit_assessment", {
      p_assessment_id: assessmentId,
      p_answers: answers
    })
    .single<SubmitAssessmentRow>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, submitAssessmentErrors, "submit_failed");
    const status =
      code === "not_authorized"
        ? 403
        : code === "assessment_not_found"
          ? 404
          : code === "attempt_exists"
            ? 409
            : code === "submit_failed"
              ? 500
              : 400;
    return NextResponse.json({ error: code }, { status });
  }

  revalidatePath(`/assessments/${assessmentId}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");
  revalidatePath("/teacher/assessments");

  return NextResponse.json({
    ok: true,
    attempt: {
      id: data.id,
      assessmentId: data.assessment_id,
      score: data.score,
      maxScore: data.max_score,
      percentage: Number(data.percentage),
      submittedAt: data.submitted_at
    }
  });
}
