import { NextResponse } from "next/server";
import { getCatalogLesson } from "@/lib/catalog";
import { localizeGameLesson } from "@/lib/i18n";
import { getOpenAIConfig, hasOpenAIEnv } from "@/lib/mentor/env";
import { requestMentorHint } from "@/lib/mentor/openai";
import { buildMentorMessages } from "@/lib/mentor/prompt";
import { checkMentorRateLimit } from "@/lib/mentor/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const MIN_QUESTION_LENGTH = 8;
const MAX_QUESTION_LENGTH = 400;
const MAX_EFFORT_LENGTH = 600;

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  if (!hasOpenAIEnv()) {
    return NextResponse.json({ error: "mentor_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as {
    lessonId?: string;
    question?: string;
    effort?: string;
    language?: "bg" | "en";
  };

  const lessonId = body.lessonId?.trim();
  const question = body.question?.trim() ?? "";
  const effort = body.effort?.trim() ?? "";
  const language = body.language === "en" ? "en" : "bg";

  if (!lessonId) {
    return NextResponse.json({ error: "lesson_required" }, { status: 400 });
  }

  if (question.length < MIN_QUESTION_LENGTH) {
    return NextResponse.json({ error: "question_too_short" }, { status: 400 });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "question_too_long" }, { status: 400 });
  }

  if (effort.length > MAX_EFFORT_LENGTH) {
    return NextResponse.json({ error: "effort_too_long" }, { status: 400 });
  }

  const lesson = await getCatalogLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "unknown_lesson" }, { status: 404 });
  }

  const { dailyLimit } = getOpenAIConfig();
  const rate = checkMentorRateLimit(user.id, dailyLimit);
  if (!rate.ok) {
    return NextResponse.json({ error: "daily_limit_reached", limit: rate.limit }, { status: 429 });
  }

  try {
    const localized = localizeGameLesson(lesson, language);
    const messages = buildMentorMessages({
      lesson: localized,
      language,
      question,
      effort: effort || undefined
    });
    const hint = await requestMentorHint(messages);

    return NextResponse.json({
      hint,
      remaining: rate.remaining,
      limit: rate.limit
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "mentor_failed";
    return NextResponse.json({ error: "mentor_failed", detail: message }, { status: 502 });
  }
}
