import type { SupabaseClient } from "@supabase/supabase-js";

export type UserDeletionBlockReason =
  | "admin_account_protected"
  | "teacher_has_classrooms"
  | "cannot_delete_self";

export async function userHasActiveClassrooms(supabase: SupabaseClient, userId: string) {
  const [owned, coTeacher] = await Promise.all([
    supabase.from("classrooms").select("id").eq("teacher_id", userId).limit(1),
    supabase.from("classroom_teachers").select("classroom_id").eq("user_id", userId).limit(1)
  ]);

  if (owned.error || coTeacher.error) {
    return { blocked: true as const, reason: "account_delete_unavailable" as const };
  }

  if ((owned.data?.length ?? 0) > 0 || (coTeacher.data?.length ?? 0) > 0) {
    return { blocked: true as const, reason: "teacher_has_classrooms" as const };
  }

  return { blocked: false as const };
}

export async function getUserDeletionBlockReason(
  supabase: SupabaseClient,
  targetUserId: string,
  options: { actorUserId: string; role: string | null | undefined; allowSelf?: boolean }
): Promise<UserDeletionBlockReason | "account_delete_unavailable" | null> {
  if (!options.allowSelf && targetUserId === options.actorUserId) {
    return "cannot_delete_self";
  }

  if (options.role === "admin") {
    return "admin_account_protected";
  }

  if (options.role === "teacher") {
    const classroomCheck = await userHasActiveClassrooms(supabase, targetUserId);
    if (classroomCheck.blocked) {
      return classroomCheck.reason;
    }
  }

  return null;
}
