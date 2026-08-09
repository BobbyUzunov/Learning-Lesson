import { NextResponse } from "next/server";
import { getKnownErrorCode, readJsonObject } from "@/lib/http";
import { parseKnowledgeCheckAnswers } from "@/lib/knowledge-check";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const completionErrors = [
  "unknown_lesson",
  "lesson_locked",
  "quiz_unavailable",
  "quiz_not_passed"
] as const;

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId.trim() : "";
  const knowledgeCheckAnswers = parseKnowledgeCheckAnswers(
    body?.knowledgeCheckAnswers ?? body?.quizAnswers
  );

  if (!lessonId || lessonId.length > 100 || !knowledgeCheckAnswers) {
    return NextResponse.json({ error: "invalid_completion_payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("complete_lesson", { p_lesson_id: lessonId, p_answers: knowledgeCheckAnswers })
    .single<{ ok: boolean; xp: number; level: number }>();

  if (error) {
    const code = getKnownErrorCode(error.message, completionErrors) ?? "completion_failed";
    const status =
      code === "unknown_lesson"
        ? 404
        : code === "quiz_unavailable"
          ? 503
          : code === "completion_failed"
            ? 500
            : 403;
    // Keep the historic error codes for cached clients; the UI translates them
    // to the current “Knowledge check” terminology.
    return NextResponse.json({ error: code }, { status });
  }

  return NextResponse.json(data);
}
