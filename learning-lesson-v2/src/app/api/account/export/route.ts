import { NextResponse } from "next/server";
import { accountExportFilename, buildAccountExportPayload } from "@/lib/account/build-export";
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
  if (!allowed) {
    return NextResponse.json({ error: "account_export_rate_limited" }, { status: 429 });
  }

  const [
    profileResult,
    progressResult,
    projectSubmissionsResult,
    assignmentSubmissionsResult,
    membershipsResult,
    mentorUsageResult
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
      .select("project_id, status, notes, repo_url, deploy_url, submitted_at, reviewed_at")
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
      .order("usage_date", { ascending: false })
  ]);

  const firstError =
    profileResult.error ??
    progressResult.error ??
    projectSubmissionsResult.error ??
    assignmentSubmissionsResult.error ??
    membershipsResult.error ??
    mentorUsageResult.error;

  if (firstError) {
    logServerError("account_export_failed", { userId: user.id, detail: firstError.message.slice(0, 200) });
    return NextResponse.json({ error: "account_export_failed" }, { status: 500 });
  }

  const payload = buildAccountExportPayload({
    userId: user.id,
    email: user.email ?? null,
    profile: (profileResult.data as Record<string, unknown> | null) ?? null,
    progress: (progressResult.data ?? []) as Record<string, unknown>[],
    projectSubmissions: (projectSubmissionsResult.data ?? []) as Record<string, unknown>[],
    assignmentSubmissions: (assignmentSubmissionsResult.data ?? []) as Record<string, unknown>[],
    classroomMemberships: (membershipsResult.data ?? []) as Record<string, unknown>[],
    mentorDailyUsage: (mentorUsageResult.data ?? []) as Record<string, unknown>[]
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${accountExportFilename(user.id)}"`,
      "Cache-Control": "no-store"
    }
  });
}
