import { redirect } from "next/navigation";
import { createClient } from "./server";
import { createE2eUser, hasE2eAuthCookie } from "./e2e-auth";
import { hasSupabaseEnv } from "./env";
import { ensureUserProfile, type ProfileRow } from "./profile";

export type UserProfile = ProfileRow;

export async function getCurrentSession() {
  if (await hasE2eAuthCookie()) {
    const user = createE2eUser();
    return {
      configured: true,
      user,
      profile: {
        id: user.id,
        auth_user_id: user.id,
        email: user.email ?? null,
        display_name: "E2E Learner",
        role: "user",
        xp: 0,
        level: 1
      } satisfies UserProfile,
      isAdmin: false,
      isTeacher: false
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
      level: 1
    } satisfies UserProfile);

  return {
    configured: true,
    user,
    profile: normalizedProfile,
    isAdmin: normalizedProfile.role === "admin",
    isTeacher: normalizedProfile.role === "teacher" || normalizedProfile.role === "admin"
  };
}

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
