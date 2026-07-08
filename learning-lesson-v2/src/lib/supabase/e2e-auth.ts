import type { User } from "@supabase/supabase-js";

export const E2E_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isE2eAuthEnabled() {
  return process.env.E2E_FAKE_AUTH === "1";
}

export async function hasE2eAuthCookie() {
  if (!isE2eAuthEnabled()) {
    return false;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("e2e-auth")?.value === "1";
}

export function createE2eUser(): User {
  return {
    id: E2E_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "e2e@test.local",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false
  };
}
