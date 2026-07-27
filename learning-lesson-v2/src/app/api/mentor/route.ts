import { NextResponse } from "next/server";
import { getCatalogLesson } from "@/lib/catalog";
import { readJsonObject } from "@/lib/http";
import { localizeGameLesson } from "@/lib/i18n";
import { hasOpenAIEnv } from "@/lib/mentor/env";
import { streamMentorHint } from "@/lib/mentor/openai";
import { buildMentorMessages, isMentorHintLevel, isMentorMode } from "@/lib/mentor/prompt";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fetchMentorUsage, reserveMentorHint } from "@/lib/supabase/mentor-usage";

const MIN_EFFORT_LENGTH = 4;
const MAX_EFFORT_LENGTH = 1600;

async function getAuthenticatedSupabase() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function extractPreviousHints(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((message): message is { role: string; parts?: unknown[] } => {
      return Boolean(message && typeof message === "object" && "role" in message && message.role === "assistant");
    })
    .flatMap((message) => {
      if (!Array.isArray(message.parts)) {
        return [];
      }

      return message.parts.flatMap((part) => {
        if (!part || typeof part !== "object" || !("type" in part) || part.type !== "text" || !("text" in part)) {
          return [];
        }

        return typeof part.text === "string" ? [part.text] : [];
      });
    })
    .slice(-2);
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
    const usage = await fetchMentorUsage(supabase);

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

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
  const effort = typeof body.effort === "string" ? body.effort.trim() : "";
  const language = body.language === "en" ? "en" : "bg";
  const mode = body.mode;
  const hintLevel = body.hintLevel;

  if (!lessonId) {
    return NextResponse.json({ error: "lesson_required" }, { status: 400 });
  }

  if (!isMentorMode(mode)) {
    return NextResponse.json({ error: "invalid_mentor_mode" }, { status: 400 });
  }

  if (!isMentorHintLevel(hintLevel)) {
    return NextResponse.json({ error: "invalid_hint_level" }, { status: 400 });
  }

  if (effort.length > MAX_EFFORT_LENGTH) {
    return NextResponse.json({ error: "effort_too_long" }, { status: 400 });
  }

  if (mode !== "start" && effort.length < MIN_EFFORT_LENGTH) {
    return NextResponse.json({ error: "effort_required" }, { status: 400 });
  }

  const lesson = await getCatalogLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "unknown_lesson" }, { status: 404 });
  }

  let reservation: Awaited<ReturnType<typeof reserveMentorHint>>;
  try {
    reservation = await reserveMentorHint(supabase);
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
      mode,
      level: hintLevel,
      effort: effort || undefined,
      previousHints: extractPreviousHints(body.messages)
    });
    const result = streamMentorHint(messages);

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Mentor-Limit": String(reservation.limit),
        "X-Mentor-Remaining": String(reservation.remaining)
      },
      onError: () => "mentor_failed"
    });
  } catch {
    return NextResponse.json({ error: "mentor_failed" }, { status: 502 });
  }
}
