import { NextResponse } from "next/server";
import { getKnownErrorCode, readJsonObject } from "@/lib/http";
import { getProjectById, validateProjectSubmissionInput } from "@/lib/projects";
import { getCourseProjects } from "@/lib/projects/store";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ projectId: string }> };

const submissionErrors = [
  "unknown_project",
  "project_locked",
  "brief_too_short",
  "brief_too_long",
  "repo_required",
  "deploy_required",
  "invalid_repo_url",
  "invalid_deploy_url",
  "submission_locked"
] as const;

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const { projectId } = await context.params;
  const { projects } = await getCourseProjects();
  const project = getProjectById(projects, projectId);
  if (!project) {
    return NextResponse.json({ error: "unknown_project" }, { status: 404 });
  }

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ error: "invalid_submission_payload" }, { status: 400 });
  }

  const validation = validateProjectSubmissionInput(project, {
    notes: typeof body.notes === "string" ? body.notes : undefined,
    repoUrl: typeof body.repoUrl === "string" ? body.repoUrl : undefined,
    deployUrl: typeof body.deployUrl === "string" ? body.deployUrl : undefined
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("submit_project", {
      p_project_id: projectId,
      p_notes: validation.value.notes,
      p_repo_url: validation.value.repoUrl,
      p_deploy_url: validation.value.deployUrl
    })
    .single<{ ok: boolean; project_id: string; status: string }>();

  if (error) {
    const code = getKnownErrorCode(error.message, submissionErrors) ?? "submission_failed";
    const status = code === "unknown_project" ? 404 : code === "project_locked" || code === "submission_locked" ? 403 : code === "submission_failed" ? 500 : 400;
    return NextResponse.json({ error: code }, { status });
  }

  return NextResponse.json({ ok: data.ok, projectId: data.project_id, status: data.status });
}
