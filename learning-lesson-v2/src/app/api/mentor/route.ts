import { NextResponse } from "next/server";
import { getCatalogLesson } from "@/lib/catalog";
import { localizeGameLesson } from "@/lib/i18n";
import { getOpenAIConfig, hasOpenAIEnv } from "@/lib/mentor/env";
import { requestMentorHint } from "@/lib/mentor/openai";
import { buildMentorMessages } from "@/lib/mentor/prompt";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fetchMentorUsage, releaseMentorHint, reserveMentorHint } from "@/lib/supabase/mentor-usage";

const MIN_QUESTION_LENGTH = 8;
const MAX_QUESTION_LENGTH = 400;
const MAX_EFFORT_LENGTH = 600;

async function getAuthenticatedSupabase() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const { dailyLimit } = getOpenAIConfig();
    const usage = await fetchMentorUsage(supabase, dailyLimit);

    return NextResponse.json({
      remaining: usage.remaining,
      limit: usage.limit,
      count: usage.count
    });
  } catch {
    return NextResponse.json({ error: "mentor_usage_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  if (!hasOpenAIEnv()) {
    return NextResponse.json({ error: "mentor_not_configured" }, { status: 503 });
  }

  const { supabase, user } = await getAuthenticatedSupabase();
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

  let reservation: Awaited<ReturnType<typeof reserveMentorHint>>;
  try {
    reservation = await reserveMentorHint(supabase, dailyLimit);
  } catch {
    return NextResponse.json({ error: "mentor_usage_unavailable" }, { status: 503 });
  }

  if (!reservation.ok) {
    return NextResponse.json({ error: "daily_limit_reached", limit: reservation.limit }, { status: 429 });
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
      remaining: reservation.remaining,
      limit: reservation.limit
    });
  } catch {
    try {
      await releaseMentorHint(supabase);
    } catch {
      // Best effort — quota may stay reserved if release fails.
    }

    return NextResponse.json({ error: "mentor_failed" }, { status: 502 });
  }
}
