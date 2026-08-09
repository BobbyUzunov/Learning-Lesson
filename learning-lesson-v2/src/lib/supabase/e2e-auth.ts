import type { User } from "@supabase/supabase-js";

export const E2E_USER_ID = "00000000-0000-4000-8000-000000000001";
export type E2eRole = "user" | "teacher" | "admin";

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

export function parseE2eRole(value: string | undefined): E2eRole {
  if (value === "teacher" || value === "admin") {
    return value;
  }
  return "user";
}

export async function getE2eAuthState() {
  if (!isE2eAuthEnabled()) {
    return null;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  if (cookieStore.get("e2e-auth")?.value !== "1") {
    return null;
  }

  return {
    role: parseE2eRole(cookieStore.get("e2e-role")?.value)
  };
}

export async function hasE2eAuthCookie() {
  return Boolean(await getE2eAuthState());
}

export function createE2eUser(role: E2eRole = "user"): User {
  return {
    id: E2E_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: role === "teacher" ? "e2e-teacher@test.local" : "e2e@test.local",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { role },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false
  };
}
