import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";
import type { AdminProjectSubmissionRecord, ProjectSubmissionRecord } from "../projects/types";

const submissionSelect =
  "id, user_id, project_id, repo_url, deploy_url, notes, submitted_at, status, review_notes, reviewed_at";

function mapSubmissionRow(row: Record<string, unknown>): ProjectSubmissionRecord {
  return {
    project_id: row.project_id as string,
    repo_url: row.repo_url as string | null,
    deploy_url: row.deploy_url as string | null,
    notes: row.notes as string | null,
    submitted_at: row.submitted_at as string | null,
    status: row.status as ProjectSubmissionRecord["status"],
    review_notes: row.review_notes as string | null,
    reviewed_at: row.reviewed_at as string | null
  };
}

async function loadProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { email: string | null; display_name: string | null }>();
  }

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, display_name").in("id", userIds);

  return new Map(
    (data ?? []).map((profile) => [
      profile.id as string,
      {
        email: profile.email as string | null,
        display_name: profile.display_name as string | null
      }
    ])
  );
}

function toAdminSubmission(
  row: Record<string, unknown>,
  profiles: Map<string, { email: string | null; display_name: string | null }>
): AdminProjectSubmissionRecord {
  const userId = row.user_id as string;
  const profile = profiles.get(userId);

  return {
    id: row.id as string,
    user_id: userId,
    ...mapSubmissionRow(row),
    learner_email: profile?.email ?? null,
    learner_name: profile?.display_name ?? null
  };
}

export async function getUserProjectSubmissions(userId: string): Promise<ProjectSubmissionRecord[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_submissions")
    .select("project_id, repo_url, deploy_url, notes, submitted_at, status, review_notes, reviewed_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load project submissions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapSubmissionRow(row as Record<string, unknown>));
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

export async function getPendingReviewSubmissions(): Promise<AdminProjectSubmissionRecord[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_submissions")
    .select(submissionSelect)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("Failed to load pending review submissions:", error.message);
    return [];
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const profiles = await loadProfilesByUserIds(rows.map((row) => row.user_id as string));
  return rows.map((row) => toAdminSubmission(row, profiles));
}

export async function getAdminSubmissionById(id: string): Promise<AdminProjectSubmissionRecord | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("project_submissions").select(submissionSelect).eq("id", id).maybeSingle();

  if (error || !data) {
    return null;
  }

  const profiles = await loadProfilesByUserIds([data.user_id as string]);
  return toAdminSubmission(data as Record<string, unknown>, profiles);
}

export { toSubmittedProjectIds } from "../projects/submissions";
