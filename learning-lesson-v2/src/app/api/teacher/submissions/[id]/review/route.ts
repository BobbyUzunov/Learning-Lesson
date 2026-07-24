import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ReviewRow = {
  id: string;
  assignment_id: string;
  status: string;
  reviewed_at: string;
};

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id: submissionId } = await context.params;
  const body = await readJsonObject(request);
  const action = body?.action;
  const teacherNote = typeof body?.teacherNote === "string" ? body.teacherNote.trim() : "";

  if (action !== "approve" && action !== "request_changes") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const status = action === "approve" ? "approved" : "needs_changes";

  if (action === "request_changes" && teacherNote.length < 5) {
    return NextResponse.json({ error: "teacher_note_required" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("review_assignment_submission", {
      p_submission_id: submissionId,
      p_status: status,
      p_teacher_note: teacherNote
    })
    .single<ReviewRow>();

  if (error) {
    const httpStatus =
      error.message.includes("not_authorized")
        ? 403
        : error.message.includes("submission_not_found")
          ? 404
          : 400;
    return NextResponse.json({ error: error.message }, { status: httpStatus });
  }

  revalidatePath("/teacher");
  revalidatePath(`/assignments/${data.assignment_id}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");

  return NextResponse.json({
    ok: true,
    submission: {
      id: data.id,
      assignmentId: data.assignment_id,
      status: data.status,
      reviewedAt: data.reviewed_at
    }
  });
}
