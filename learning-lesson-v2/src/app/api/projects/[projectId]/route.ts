import { NextResponse } from "next/server";
import { getProjectById, isProjectUnlocked, validateProjectSubmissionInput } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const { projectId } = await context.params;
  const project = getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Unknown project." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: progressRows, error: progressError } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const completedLessonIds = (progressRows ?? []).map((row) => row.lesson_id as string);

  if (!isProjectUnlocked(project, completedLessonIds)) {
    return NextResponse.json({ error: "Project is locked." }, { status: 403 });
  }

  const body = (await request.json()) as {
    notes?: string;
    repoUrl?: string;
    deployUrl?: string;
  };

  const validation = validateProjectSubmissionInput(project, body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { error } = await supabase.from("project_submissions").upsert(
    {
      user_id: user.id,
      project_id: project.id,
      notes: validation.value.notes,
      repo_url: validation.value.repoUrl,
      deploy_url: validation.value.deployUrl,
      submitted_at: new Date().toISOString()
    },
    { onConflict: "user_id,project_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, projectId: project.id });
}
