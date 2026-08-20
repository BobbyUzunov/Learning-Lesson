import { NextResponse } from "next/server";
import { readJsonObject } from "@/lib/http";
import { E2E_ASSIGNMENT_ID, e2eStudentAssignment } from "@/lib/assignments/e2e-fixture";
import { isMentorOpenStatus } from "@/lib/mentor/access";
import { hasOpenAIEnv } from "@/lib/mentor/env";
import { streamMentorHint } from "@/lib/mentor/openai";
import { buildMentorMessages, isMentorHintLevel, isMentorMode } from "@/lib/mentor/prompt";
import { logServerError } from "@/lib/observability";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getE2eAuthState } from "@/lib/supabase/e2e-auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getAssignmentById, getMySubmissionForAssignment } from "@/lib/supabase/assignments";
import { getMyClassroomIds } from "@/lib/supabase/memberships";
import { fetchMentorUsage, reserveMentorHint } from "@/lib/supabase/mentor-usage";

const MIN_EFFORT_LENGTH = 4;
const MAX_EFFORT_LENGTH = 1600;

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

async function requireStudentSession() {
  const session = await getCurrentSession();
  if (!session.user) {
    return { ok: false as const, response: NextResponse.json({ error: "not_authenticated" }, { status: 401 }) };
  }

  if (session.isTeacher) {
    return { ok: false as const, response: NextResponse.json({ error: "student_required" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const auth = await requireStudentSession();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const supabase = await createClient();
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

  const auth = await requireStudentSession();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const assignmentId = typeof body.assignmentId === "string" ? body.assignmentId.trim() : "";
  const effort = typeof body.effort === "string" ? body.effort.trim() : "";
  const language = body.language === "en" ? "en" : "bg";
  const mode = body.mode;
  const hintLevel = body.hintLevel;

  if (!assignmentId) {
    return NextResponse.json({ error: "assignment_required" }, { status: 400 });
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

  const e2e = await getE2eAuthState();
  const assignment =
    e2e?.role === "user" && assignmentId === E2E_ASSIGNMENT_ID
      ? e2eStudentAssignment()
      : await getAssignmentById(assignmentId);

  if (!assignment) {
    return NextResponse.json({ error: "assignment_not_found" }, { status: 404 });
  }

  if (!(e2e?.role === "user" && assignmentId === E2E_ASSIGNMENT_ID)) {
    const classroomIds = await getMyClassroomIds();
    if (!classroomIds.includes(assignment.classroomId)) {
      return NextResponse.json({ error: "not_authorized" }, { status: 403 });
    }
  }

  const submission =
    e2e?.role === "user" && assignmentId === E2E_ASSIGNMENT_ID
      ? null
      : await getMySubmissionForAssignment(assignmentId);
  const status = submission?.status ?? assignment.submissionStatus ?? "missing";

  if (!isMentorOpenStatus(status)) {
    return NextResponse.json({ error: "assignment_closed" }, { status: 403 });
  }

  const supabase = await createClient();
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
    const title =
      language === "bg"
        ? assignment.titleOverride || assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
        : assignment.titleOverride || assignment.missionTitle || assignment.missionId;
    const messages = buildMentorMessages({
      title,
      brief: language === "bg" ? assignment.missionBriefBg || assignment.missionBrief : assignment.missionBrief,
      deliverable:
        language === "bg"
          ? assignment.missionDeliverableBg || assignment.missionDeliverable
          : assignment.missionDeliverable,
      instructions: assignment.instructions,
      teacherNote: submission?.teacherNote ?? assignment.teacherNote,
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
    logServerError("mentor_failed", { assignmentId });
    return NextResponse.json({ error: "mentor_failed" }, { status: 502 });
  }
}
