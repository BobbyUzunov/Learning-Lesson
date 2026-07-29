import { cache } from "react";
import { getCurrentSession } from "./auth";
import { createClient } from "./server";

async function loadMyClassroomIds(): Promise<string[]> {
  const session = await getCurrentSession();
  if (!session.user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("student_id", session.user.id);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.classroom_id as string);
}

export const getMyClassroomIds = cache(loadMyClassroomIds);
