import type { SupabaseClient, User } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  xp: number;
  level: number;
  created_at?: string;
};

export function deriveDisplayName(user: Pick<User, "email" | "user_metadata">, fallback?: string) {
  const metadata = user.user_metadata ?? {};
  const fromMetadata = metadata.display_name ?? metadata.full_name ?? metadata.name;

  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "Learner";
  }

  return "Learner";
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email" | "user_metadata">,
  options?: { displayName?: string }
) {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id,auth_user_id,email,display_name,role,xp,level,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { profile: null as ProfileRow | null, created: false, error: readError };
  }

  if (existing) {
    return { profile: existing as ProfileRow, created: false, error: null };
  }

  const row = {
    id: user.id,
    auth_user_id: user.id,
    email: user.email ?? null,
    display_name: deriveDisplayName(user, options?.displayName),
    role: "user",
    xp: 0,
    level: 1
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert(row)
    .select("id,auth_user_id,email,display_name,role,xp,level,created_at")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: raced } = await supabase
        .from("profiles")
        .select("id,auth_user_id,email,display_name,role,xp,level,created_at")
        .eq("id", user.id)
        .maybeSingle();

      return { profile: (raced as ProfileRow | null) ?? null, created: false, error: null };
    }

    return { profile: null, created: false, error: insertError };
  }

  return { profile: (inserted as ProfileRow | null) ?? null, created: true, error: null };
}
