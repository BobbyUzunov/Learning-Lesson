import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";
import type { ProjectSubmissionRecord } from "../projects";

export async function getUserProjectSubmissions(userId: string): Promise<ProjectSubmissionRecord[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_submissions")
    .select("project_id, repo_url, deploy_url, notes, submitted_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load project submissions:", error.message);
    return [];
  }

  return (data ?? []) as ProjectSubmissionRecord[];
}

export async function getCurrentUserProjectSubmissions() {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return getUserProjectSubmissions(user.id);
}

export function toSubmittedProjectIds(submissions: ProjectSubmissionRecord[]) {
  return submissions.filter((item) => Boolean(item.submitted_at)).map((item) => item.project_id);
}
