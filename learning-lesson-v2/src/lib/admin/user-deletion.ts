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

export function isAuthUserMissingError(message: string | undefined) {
  return Boolean(message && /user not found/i.test(message));
}

/**
 * Removes an auth user. If Auth already has no row for the id (orphaned
 * public.profiles row), purge the profile so the Roles page can clear it.
 */
export async function deleteAuthUserOrOrphanProfile(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (!error) {
    return { ok: true };
  }

  if (!isAuthUserMissingError(error.message)) {
    return { ok: false, detail: error.message };
  }

  const { error: purgeError } = await admin.rpc("purge_orphaned_profile", { p_user_id: userId });
  if (!purgeError) {
    return { ok: true };
  }

  // Fallback when the purge RPC is not migrated yet: direct profile delete.
  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError) {
    return { ok: false, detail: profileError.message || purgeError.message };
  }

  return { ok: true };
}
