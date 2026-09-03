import { NextResponse } from "next/server";
import { isSignupPasswordValid } from "@/lib/auth-password";
import { isValidDisplayName } from "@/lib/display-name";
import { isDuplicateSignupError, registerUserWithAdmin } from "@/lib/auth/register-user";
import { hashClientIp, rateLimitBucketFromRequest } from "@/lib/http/client-ip";
import { readJsonObject } from "@/lib/http";
import { consumeRateLimit } from "@/lib/http/rate-limit";
import { logServerError } from "@/lib/observability";
import { PILOT_STUDENT_GRADE } from "@/lib/pilot";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_IP_RATE_LIMIT = {
  max: 20,
  windowSeconds: 60 * 60
} as const;

const SIGNUP_EMAIL_RATE_LIMIT = {
  max: 5,
  windowSeconds: 60 * 60
} as const;

function isAccountRole(value: unknown): value is "user" | "teacher" {
  return value === "user" || value === "teacher";
}

function buildSignupMetadata(
  email: string,
  displayName: string,
  accountRole: "user" | "teacher"
) {
  return {
    display_name: displayName || email.split("@")[0],
    intended_role: accountRole,
    grade_level: accountRole === "user" ? PILOT_STUDENT_GRADE : undefined,
    privacy_accepted_at: new Date().toISOString()
  };
}

/** Same shape for created / unconfirmed / already-registered — no account enumeration. */
function genericSignupSuccess() {
  return NextResponse.json({ ok: true, needsEmailConfirmation: true });
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const accountRole = body?.accountRole;

  if (!email || !password || !isAccountRole(accountRole)) {
    return NextResponse.json({ error: "invalid_signup_payload" }, { status: 400 });
  }

  if (!isSignupPasswordValid(password)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 400 });
  }

  if (body?.acceptedPrivacy !== true) {
    return NextResponse.json({ error: "privacy_consent_required" }, { status: 400 });
  }

  if (displayName && !isValidDisplayName(displayName)) {
    return NextResponse.json({ error: "invalid_display_name" }, { status: 400 });
  }

  const emailBucket = `signup-email:${hashClientIp(email.toLowerCase())}`;
  const [ipDecision, emailDecision] = await Promise.all([
    consumeRateLimit(rateLimitBucketFromRequest(request, "signup"), SIGNUP_IP_RATE_LIMIT),
    consumeRateLimit(emailBucket, SIGNUP_EMAIL_RATE_LIMIT)
  ]);

  if (ipDecision === "unavailable" || emailDecision === "unavailable") {
    return NextResponse.json({ error: "signup_unavailable" }, { status: 503 });
  }

  if (ipDecision === "limited" || emailDecision === "limited") {
    return NextResponse.json({ error: "signup_rate_limited" }, { status: 429 });
  }

  const origin = new URL(request.url).origin;
  const metadata = buildSignupMetadata(email, displayName, accountRole);
  const redirectTo = `${origin}/auth/callback?next=/verify-email`;

  if (hasSupabaseAdminEnv()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const result = await registerUserWithAdmin(admin, {
      email,
      password,
      metadata,
      redirectTo
    });

    if (result.error) {
      logServerError("signup_failed", {
        channel: "admin",
        detail: result.error.slice(0, 200)
      });
      return NextResponse.json({ error: "signup_failed" }, { status: 400 });
    }

    if (result.resendError) {
      logServerError("signup_confirmation_email_failed", {
        detail: result.resendError.slice(0, 200)
      });
    }

    return genericSignupSuccess();
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: metadata
    }
  });

  if (error) {
    if (isDuplicateSignupError(error.message)) {
      return genericSignupSuccess();
    }

    logServerError("signup_failed", { channel: "public", detail: error.message.slice(0, 200) });
    return NextResponse.json({ error: "signup_failed" }, { status: 400 });
  }

  return genericSignupSuccess();
}
