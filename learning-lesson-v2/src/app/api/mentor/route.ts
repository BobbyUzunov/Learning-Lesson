import { NextResponse } from "next/server";
import { readJsonObject } from "@/lib/http";
import { assignmentDisplayTitle, assignmentMentorBrief, isCustomAssignment } from "@/lib/assignments/title";
import { E2E_ASSIGNMENT_ID, e2eStudentAssignment } from "@/lib/assignments/e2e-fixture";
import { isMentorOpenStatus } from "@/lib/mentor/access";
import {
  buildMentorEffortForModel,
  MAX_STORED_MENTOR_EFFORT
} from "@/lib/mentor/effort-excerpt";
import { hasOpenAIEnv } from "@/lib/mentor/env";
import { streamCachedMentorHint, streamMentorHint } from "@/lib/mentor/openai";
import { buildMentorMessages, isMentorHintLevel, isMentorMode } from "@/lib/mentor/prompt";
import { logServerError } from "@/lib/observability";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getE2eAuthState } from "@/lib/supabase/e2e-auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getAssignmentById, getMySubmissionForAssignment } from "@/lib/supabase/assignments";
import { getMyClassroomIds } from "@/lib/supabase/memberships";
import { fetchMentorUsage, reserveMentorHint } from "@/lib/supabase/mentor-usage";
import {
  failAssignmentMentorHint,
  fetchMentorHintHistory,
  finalizeAssignmentMentorHint,
  reserveAssignmentMentorSlot
} from "@/lib/supabase/mentor-history";

const MIN_EFFORT_LENGTH = 4;

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

function mentorQuotaHeaders(remaining: number, limit: number, effortExcerpted: boolean) {
  return {
    "X-Mentor-Limit": String(limit),
    "X-Mentor-Remaining": String(remaining),
    "X-Mentor-Effort-Excerpt": effortExcerpted ? "true" : "false"
  };
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

export async function GET(request: Request) {
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
    const assignmentId = new URL(request.url).searchParams.get("assignmentId")?.trim() ?? "";
    let history: Awaited<ReturnType<typeof fetchMentorHintHistory>> = [];

    if (assignmentId) {
      const e2e = await getE2eAuthState();
      if (!(e2e?.role === "user" && assignmentId === E2E_ASSIGNMENT_ID)) {
        const assignment = await getAssignmentById(assignmentId);
        if (!assignment) {
          return NextResponse.json({ error: "assignment_not_found" }, { status: 404 });
        }
        const classroomIds = await getMyClassroomIds();
        if (!classroomIds.includes(assignment.classroomId)) {
          return NextResponse.json({ error: "not_authorized" }, { status: 403 });
        }
        history = await fetchMentorHintHistory(supabase, assignmentId);
      }
    }

    return NextResponse.json({
      remaining: usage.remaining,
      limit: usage.limit,
      count: usage.count,
      history
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
  const effortRaw = typeof body.effort === "string" ? body.effort.trim() : "";
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

  if (effortRaw.length > MAX_STORED_MENTOR_EFFORT) {
    return NextResponse.json({ error: "effort_too_long" }, { status: 400 });
  }

  if (mode !== "start" && effortRaw.length < MIN_EFFORT_LENGTH) {
    return NextResponse.json({ error: "effort_required" }, { status: 400 });
  }

  const effortForModel = buildMentorEffortForModel(effortRaw);

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
  let history: Awaited<ReturnType<typeof fetchMentorHintHistory>> = [];
  if (!e2e) {
    try {
      history = await fetchMentorHintHistory(supabase, assignmentId);
    } catch {
      return NextResponse.json({ error: "mentor_history_unavailable" }, { status: 503 });
    }
  }

  if (history.length >= 3) {
    return NextResponse.json({ error: "task_limit_reached" }, { status: 429 });
  }

  if (!e2e && hintLevel !== history.length + 1) {
    return NextResponse.json({ error: "invalid_hint_level" }, { status: 409 });
  }

  let reservedHintId: string | null = null;
  let quotaRemaining = 0;
  let quotaLimit = 0;

  if (e2e) {
    let reservation: Awaited<ReturnType<typeof reserveMentorHint>>;
    try {
      reservation = await reserveMentorHint(supabase);
    } catch {
      return NextResponse.json({ error: "mentor_usage_unavailable" }, { status: 503 });
    }

    if (!reservation.ok) {
      return NextResponse.json({ error: "daily_limit_reached", limit: reservation.limit }, { status: 429 });
    }

    quotaRemaining = reservation.remaining;
    quotaLimit = reservation.limit;
  } else {
    let slot: Awaited<ReturnType<typeof reserveAssignmentMentorSlot>>;
    try {
      slot = await reserveAssignmentMentorSlot(supabase, {
        assignmentId,
        hintLevel,
        mode,
        effort: effortRaw
      });
    } catch {
      return NextResponse.json({ error: "mentor_usage_unavailable" }, { status: 503 });
    }

    quotaRemaining = slot.remaining;
    quotaLimit = slot.limit;

    if (slot.outcome === "daily_limit") {
      return NextResponse.json({ error: "daily_limit_reached", limit: slot.limit }, { status: 429 });
    }

    if (slot.outcome === "task_limit") {
      return NextResponse.json({ error: "task_limit_reached" }, { status: 429 });
    }

    if (slot.outcome === "pending") {
      return NextResponse.json({ error: "mentor_pending" }, { status: 409 });
    }

    if (slot.outcome === "ready" && slot.hintText) {
      return streamCachedMentorHint(slot.hintText).toUIMessageStreamResponse({
        headers: mentorQuotaHeaders(slot.remaining, slot.limit, effortForModel.excerpted)
      });
    }

    reservedHintId = slot.hintId;
  }

  const title = assignmentDisplayTitle(assignment, language);
  const messages = buildMentorMessages({
    title,
    brief: assignmentMentorBrief(assignment, language),
    deliverable: isCustomAssignment(assignment)
      ? undefined
      : language === "bg"
        ? assignment.missionDeliverableBg || assignment.missionDeliverable
        : assignment.missionDeliverable,
    instructions: assignment.instructions,
    teacherNote: submission?.teacherNote ?? assignment.teacherNote,
    language,
    mode,
    level: hintLevel,
    effort: effortForModel.text || undefined,
    previousHints: extractPreviousHints(body.messages)
  });

  try {
    const result = streamMentorHint(messages, async (generated) => {
      if (e2e || !generated.text.trim()) {
        return;
      }

      if (!reservedHintId) {
        logServerError("mentor_history_save_failed", { assignmentId, reason: "missing_hint_id" });
        throw new Error("mentor_history_save_failed");
      }

      try {
        await finalizeAssignmentMentorHint(supabase, {
          hintId: reservedHintId,
          text: generated.text.trim(),
          model: generated.model,
          inputTokens: generated.inputTokens,
          outputTokens: generated.outputTokens
        });
      } catch {
        try {
          await failAssignmentMentorHint(supabase, reservedHintId);
        } catch {
          logServerError("mentor_fail_slot_failed", { assignmentId, hintId: reservedHintId });
        }
        logServerError("mentor_history_save_failed", { assignmentId });
        throw new Error("mentor_history_save_failed");
      }
    });

    return result.toUIMessageStreamResponse({
      headers: mentorQuotaHeaders(quotaRemaining, quotaLimit, effortForModel.excerpted),
      onError: () => "mentor_failed"
    });
  } catch {
    if (reservedHintId) {
      try {
        // Provider/setup failures still consume the reserved daily quota (no client refund).
        await failAssignmentMentorHint(supabase, reservedHintId);
      } catch {
        logServerError("mentor_fail_slot_failed", { assignmentId, hintId: reservedHintId });
      }
    }

    logServerError("mentor_failed", { assignmentId });
    return NextResponse.json({ error: "mentor_failed" }, { status: 502 });
  }
}
