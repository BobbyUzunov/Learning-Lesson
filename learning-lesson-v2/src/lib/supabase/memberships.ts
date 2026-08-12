import { cache } from "react";
import { getCurrentSession } from "./auth";
import { createClient } from "./server";
import { hasSupabaseDataEnv } from "./data-env";
import { throwLoadError } from "./load-error";

async function loadMyClassroomIds(): Promise<string[]> {
  const session = await getCurrentSession();
  if (!session.user || !hasSupabaseDataEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("student_id", session.user.id);

  if (error) {
    throwLoadError("student_classroom_memberships_unavailable", error);
  }

  return (data ?? []).map((row) => row.classroom_id as string);
}

export const getMyClassroomIds = cache(loadMyClassroomIds);
