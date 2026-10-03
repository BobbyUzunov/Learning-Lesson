import { NextResponse } from "next/server";
import { resolvePublicErrorCode } from "@/lib/http";
import { getSubmissionReviewHistory } from "@/lib/supabase/assignments";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const historyErrors = ["not_authenticated", "submission_not_found", "not_authorized"] as const;

function historyErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "submission_not_found") return 404;
  if (code === "teacher_submission_review_history_unavailable") return 500;
  return 400;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id: submissionId } = await context.params;

  try {
    const history = await getSubmissionReviewHistory(submissionId);
    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "history_failed";
    const code = resolvePublicErrorCode(message, historyErrors, "teacher_submission_review_history_unavailable");
    return NextResponse.json({ error: code }, { status: historyErrorStatus(code) });
  }
}
