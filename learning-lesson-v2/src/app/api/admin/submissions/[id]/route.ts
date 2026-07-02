import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProjectById } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { getAdminSubmissionById } from "@/lib/supabase/project-submissions";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await context.params;
  const submission = await getAdminSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    action?: "approve" | "request_changes";
    reviewNotes?: string;
  };

  if (body.action !== "approve" && body.action !== "request_changes") {
    return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  }

  const reviewNotes = body.reviewNotes?.trim() ?? "";
  if (body.action === "request_changes" && reviewNotes.length < 10) {
    return NextResponse.json({ error: "review_notes_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("project_submissions")
    .update({
      status: body.action === "approve" ? "approved" : "needs_changes",
      review_notes: reviewNotes || null,
      reviewed_at: now,
      reviewed_by: auth.user.id
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { projects } = await getCourseProjects();
  const project = getProjectById(projects, submission.project_id);

  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/reviews/${id}`);
  revalidatePath("/profile");
  revalidatePath("/paths");
  if (project) {
    revalidatePath(`/projects/${project.id}`);
  }

  return NextResponse.json({
    ok: true,
    status: body.action === "approve" ? "approved" : "needs_changes"
  });
}
