import type { User } from "@supabase/supabase-js";

export const E2E_USER_ID = "00000000-0000-4000-8000-000000000001";

/**
 * E2E fake auth is allowed only for local/CI test runs.
 * It is always disabled on Vercel production, and on other Vercel
 * deployments unless ALLOW_E2E_FAKE_AUTH=1 is set explicitly.
 */
export function isE2eAuthEnabled() {
  if (process.env.E2E_FAKE_AUTH !== "1") {
    return false;
  }

  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  // Local machine (not deployed on Vercel): Playwright `next start` is fine.
  if (!process.env.VERCEL_ENV) {
    return true;
  }

  // Vercel preview/development: require an explicit second switch.
  return process.env.CI === "true" || process.env.ALLOW_E2E_FAKE_AUTH === "1";
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
