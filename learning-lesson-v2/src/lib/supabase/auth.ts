import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import { createE2eUser, getE2eAuthState } from "./e2e-auth";
import { isAdminEmailAllowed } from "./admin-allowlist";
import { hasSupabaseEnv } from "./env";
import { ensureUserProfile, type ProfileRow } from "./profile";

export type UserProfile = ProfileRow;

async function loadCurrentSession() {
  const e2e = await getE2eAuthState();
  if (e2e) {
    const user = createE2eUser(e2e.role);
    const role = e2e.role === "admin" ? "admin" : e2e.role === "teacher" ? "teacher" : "user";
    return {
      configured: true,
      user,
      profile: {
        id: user.id,
        auth_user_id: user.id,
        email: user.email ?? null,
        display_name: role === "teacher" ? "E2E Teacher" : role === "admin" ? "E2E Admin" : "E2E Learner",
        role,
        xp: 0,
        level: 1,
        streak_count: 0
      } satisfies UserProfile,
      isAdmin: role === "admin",
      isTeacher: role === "teacher" || role === "admin"
    };
  }

  if (!hasSupabaseEnv()) {
    return { configured: false, user: null, profile: null, isAdmin: false, isTeacher: false };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, profile: null, isAdmin: false, isTeacher: false };
  }

  const { profile } = await ensureUserProfile(supabase, user);

  const normalizedProfile =
    profile ??
    ({
      id: user.id,
      auth_user_id: user.id,
      email: user.email ?? null,
      display_name: user.email?.split("@")[0] ?? "Learner",
      role: "user",
      xp: 0,
      level: 1,
      streak_count: 0
    } satisfies UserProfile);

  const roleIsAdmin = normalizedProfile.role === "admin";
  const allowlisted = isAdminEmailAllowed(normalizedProfile.email ?? user.email);

  return {
    configured: true,
    user,
    profile: normalizedProfile,
    isAdmin: roleIsAdmin && allowlisted,
    isTeacher: normalizedProfile.role === "teacher" || (roleIsAdmin && allowlisted)
  };
}

export const getCurrentSession = cache(loadCurrentSession);

export async function requireUser(message = "Please login to continue your learning journey.") {
  const session = await getCurrentSession();

  if (!session.user) {
    redirect(`/login?message=${encodeURIComponent(message)}`);
  }

  return session as Awaited<ReturnType<typeof getCurrentSession>> & {
    user: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>["user"]>;
  };
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role === "admin" && !isAdminEmailAllowed(session.profile.email ?? session.user.email)) {
    redirect(`/login?message=${encodeURIComponent("admin_allowlist")}`);
  }

  if (!session.isAdmin) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireTeacher() {
  const session = await requireUser();

  if (!session.isTeacher) {
    redirect("/dashboard");
  }

  return session;
}
