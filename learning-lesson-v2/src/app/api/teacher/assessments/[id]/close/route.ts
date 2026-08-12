import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { resolvePublicErrorCode } from "@/lib/http";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const closeAssessmentErrors = ["not_authenticated", "not_authorized", "assessment_not_found"] as const;

function closeAssessmentErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "assessment_not_found") return 404;
  return 500;
}

export async function POST(_request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id: assessmentId } = await context.params;
  const { data, error } = await auth
    .supabase!.rpc("close_classroom_assessment", { p_assessment_id: assessmentId })
    .single<{ id: string; status: string }>();

  if (error) {
    const code = resolvePublicErrorCode(error.message, closeAssessmentErrors, "close_failed");
    return NextResponse.json({ error: code }, { status: closeAssessmentErrorStatus(code) });
  }

  revalidatePath(`/teacher/assessments/${assessmentId}`);
  revalidatePath("/teacher/assessments");
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true, assessment: data });
}
