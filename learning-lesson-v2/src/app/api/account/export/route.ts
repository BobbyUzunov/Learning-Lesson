import { NextResponse } from "next/server";
import {
  accountExportFilename,
  buildAccountExportPayload,
  consentFromUserMetadata
} from "@/lib/account/build-export";
import { rateLimitBucketFromRequest } from "@/lib/http/client-ip";
import { consumeRateLimit } from "@/lib/http/rate-limit";
import { logServerError } from "@/lib/observability";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const EXPORT_RATE_LIMIT = {
  max: 10,
  windowSeconds: 60 * 60
} as const;

export async function GET(request: Request) {
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

  const allowed = await consumeRateLimit(
    `${rateLimitBucketFromRequest(request, "account-export")}:${user.id}`,
    EXPORT_RATE_LIMIT
  );
  if (allowed === "unavailable") {
    return NextResponse.json({ error: "account_export_unavailable" }, { status: 503 });
  }
  if (allowed === "limited") {
    return NextResponse.json({ error: "account_export_rate_limited" }, { status: 429 });
  }

  const [
    profileResult,
    progressResult,
    projectSubmissionsResult,
    assignmentSubmissionsResult,
    membershipsResult,
    mentorUsageResult,
    mentorHintsResult,
    assessmentAttemptsResult,
    reviewHistoryResult
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, display_name, role, xp, level, streak_count, last_visit, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_progress")
      .select("lesson_id, completed, xp_earned, completed_at")
      .eq("user_id", user.id),
    supabase
      .from("project_submissions")
      .select("project_id, status, notes, review_notes, repo_url, deploy_url, submitted_at, reviewed_at")
      .eq("user_id", user.id),
    supabase
      .from("assignment_submissions")
      .select(
        "assignment_id, status, deliverable_text, deliverable_url, teacher_note, submitted_at, reviewed_at"
      )
      .eq("student_id", user.id),
    supabase
      .from("classroom_members")
      .select("classroom_id, joined_at, roster_name")
      .eq("student_id", user.id),
    supabase
      .from("mentor_daily_usage")
      .select("usage_date, request_count, updated_at")
      .eq("user_id", user.id)
      .order("usage_date", { ascending: false }),
    supabase
      .from("assignment_mentor_hints")
      .select("id, assignment_id, hint_level, mode, effort, hint_text, model, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assessment_attempts")
      .select("id, assessment_id, answers, score, max_score, percentage, submitted_at")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false }),
    supabase.rpc("export_my_assignment_review_history")
  ]);

  const firstError =
    profileResult.error ??
    progressResult.error ??
    projectSubmissionsResult.error ??
    assignmentSubmissionsResult.error ??
    membershipsResult.error ??
    mentorUsageResult.error ??
    mentorHintsResult.error ??
    assessmentAttemptsResult.error ??
    reviewHistoryResult.error;

  if (firstError) {
    logServerError("account_export_failed", { userId: user.id, detail: firstError.message.slice(0, 200) });
    return NextResponse.json({ error: "account_export_failed" }, { status: 500 });
  }

  const payload = buildAccountExportPayload({
    userId: user.id,
    email: user.email ?? null,
    profile: (profileResult.data as Record<string, unknown> | null) ?? null,
    consent: consentFromUserMetadata(user.user_metadata as Record<string, unknown> | undefined),
    progress: (progressResult.data ?? []) as Record<string, unknown>[],
    projectSubmissions: (projectSubmissionsResult.data ?? []) as Record<string, unknown>[],
    assignmentSubmissions: (assignmentSubmissionsResult.data ?? []) as Record<string, unknown>[],
    assignmentReviewHistory: (reviewHistoryResult.data ?? []) as Record<string, unknown>[],
    assessmentAttempts: (assessmentAttemptsResult.data ?? []) as Record<string, unknown>[],
    classroomMemberships: (membershipsResult.data ?? []) as Record<string, unknown>[],
    mentorDailyUsage: (mentorUsageResult.data ?? []) as Record<string, unknown>[],
    mentorHintHistory: (mentorHintsResult.data ?? []) as Record<string, unknown>[]
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${accountExportFilename(user.id)}"`,
      "Cache-Control": "no-store"
    }
  });
}
