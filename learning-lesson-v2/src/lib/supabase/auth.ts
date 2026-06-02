import { redirect } from "next/navigation";
import { createClient } from "./server";
import { hasSupabaseEnv } from "./env";

export type UserProfile = {
  id: string;
  email: string | null;
  role: "user" | "admin" | string;
  xp: number;
  level: number;
  created_at?: string;
};

export async function getCurrentSession() {
  if (!hasSupabaseEnv()) {
    return { configured: false, user: null, profile: null, isAdmin: false };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, profile: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,xp,level,created_at")
    .eq("id", user.id)
    .maybeSingle();

  const normalizedProfile =
    profile ??
    ({
      id: user.id,
      email: user.email ?? null,
      role: "user",
      xp: 0,
      level: 1
    } satisfies UserProfile);

  return {
    configured: true,
    user,
    profile: normalizedProfile as UserProfile,
    isAdmin: normalizedProfile.role === "admin"
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
