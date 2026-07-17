import { NextResponse } from "next/server";
import { getKnownErrorCode, readJsonObject } from "@/lib/http";
import type { QuizAnswer } from "@/lib/quiz/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const completionErrors = [
  "unknown_lesson",
  "lesson_locked",
  "quiz_unavailable",
  "quiz_not_passed"
] as const;

function parseQuizAnswers(value: unknown): QuizAnswer[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) {
    return null;
  }

  const answers: QuizAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const { questionId, selectedIndex } = item as Record<string, unknown>;
    if (
      typeof questionId !== "string" ||
      questionId.length < 1 ||
      questionId.length > 100 ||
      !Number.isInteger(selectedIndex) ||
      (selectedIndex as number) < 0 ||
      (selectedIndex as number) > 20
    ) {
      return null;
    }

    answers.push({ questionId, selectedIndex: selectedIndex as number });
  }

  return new Set(answers.map((answer) => answer.questionId)).size === answers.length ? answers : null;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId.trim() : "";
  const quizAnswers = parseQuizAnswers(body?.quizAnswers);

  if (!lessonId || lessonId.length > 100 || !quizAnswers) {
    return NextResponse.json({ error: "invalid_completion_payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("complete_lesson", { p_lesson_id: lessonId, p_answers: quizAnswers })
    .single<{ ok: boolean; xp: number; level: number }>();

  if (error) {
    const code = getKnownErrorCode(error.message, completionErrors) ?? "completion_failed";
    const status = code === "unknown_lesson" ? 404 : code === "completion_failed" ? 500 : 403;
    return NextResponse.json({ error: code }, { status });
  }

  return NextResponse.json(data);
}
