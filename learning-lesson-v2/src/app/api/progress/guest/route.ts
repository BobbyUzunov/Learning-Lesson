import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getFallbackCatalog, getFirstLesson } from "@/lib/catalog";
import { getKnownErrorCode, readJsonObject } from "@/lib/http";
import {
  guestProgressClaimCookie,
  guestProgressClaimMaxAge,
  guestProgressClaimPath
} from "@/lib/guest-progress-claim";
import {
  getFallbackKnowledgeCheckContent,
  getKnowledgeCheckTopicForLesson,
  gradeKnowledgeCheckAnswers,
  parseKnowledgeCheckAnswers,
  type KnowledgeCheckAnswer
} from "@/lib/knowledge-check";
import { logServerError } from "@/lib/observability";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { isE2eAuthEnabled } from "@/lib/supabase/e2e-auth";

const issueErrors = [
  "invalid_guest_progress",
  "quiz_unavailable",
  "quiz_not_passed",
  "knowledge_check_unavailable",
  "knowledge_check_not_passed",
  "guest_claim_rate_limited",
  "guest_claim_capacity_reached"
] as const;

type GuestClaimResult = {
  ok: boolean;
  claim_token: string;
  expires_at: string;
};

function locallyGradeE2eClaim(lessonId: string, answers: KnowledgeCheckAnswer[]) {
  const firstLesson = getFirstLesson(getFallbackCatalog());
  if (!firstLesson || lessonId !== firstLesson.id) {
    return null;
  }

  const content = getFallbackKnowledgeCheckContent();
  const topic = getKnowledgeCheckTopicForLesson(content, lessonId);
  if (!topic) {
    return null;
  }

  return gradeKnowledgeCheckAnswers(
    content.questions.filter((question) => question.topic === topic),
    answers
  );
}

function withClaimCookie(claimToken: string) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(guestProgressClaimCookie, claimToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: guestProgressClaimPath,
    maxAge: guestProgressClaimMaxAge
  });
  return response;
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId.trim() : "";
  const knowledgeCheckAnswers = parseKnowledgeCheckAnswers(
    body?.knowledgeCheckAnswers ?? body?.quizAnswers
  );

  if (!lessonId || lessonId.length > 100 || !knowledgeCheckAnswers) {
    return NextResponse.json({ error: "invalid_guest_progress" }, { status: 400 });
  }

  if (isE2eAuthEnabled()) {
    const grade = locallyGradeE2eClaim(lessonId, knowledgeCheckAnswers);
    if (!grade?.passed) {
      return NextResponse.json({ error: "quiz_not_passed" }, { status: 403 });
    }

    return withClaimCookie(randomBytes(32).toString("hex"));
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("issue_guest_progress_claim", {
      p_lesson_id: lessonId,
      p_answers: knowledgeCheckAnswers
    })
    .single<GuestClaimResult>();

  if (error) {
    const code = getKnownErrorCode(error.message, issueErrors) ?? "guest_proof_issue_failed";
    const status =
      code === "invalid_guest_progress"
        ? 400
        : code === "guest_claim_rate_limited"
          ? 429
          : code === "quiz_unavailable" ||
              code === "knowledge_check_unavailable" ||
              code === "guest_claim_capacity_reached"
            ? 503
            : code === "quiz_not_passed" || code === "knowledge_check_not_passed"
              ? 403
              : 500;

    if (code === "guest_proof_issue_failed") {
      logServerError("issue_guest_progress_claim_failed", {
        lessonId,
        detail: error.message.slice(0, 200)
      });
    }

    return NextResponse.json({ error: code }, { status });
  }

  if (!data?.ok || !/^[0-9a-f]{64}$/.test(data.claim_token)) {
    logServerError("issue_guest_progress_claim_invalid_result", { lessonId });
    return NextResponse.json({ error: "guest_proof_issue_failed" }, { status: 500 });
  }

  return withClaimCookie(data.claim_token);
}
