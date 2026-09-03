import { NextResponse } from "next/server";
import { isSignupPasswordValid } from "@/lib/auth-password";
import { isValidDisplayName } from "@/lib/display-name";
import { isDuplicateSignupError, registerUserWithAdmin } from "@/lib/auth/register-user";
import { rateLimitBucketFromRequest } from "@/lib/http/client-ip";
import { readJsonObject } from "@/lib/http";
import { consumeRateLimit } from "@/lib/http/rate-limit";
import { logServerError } from "@/lib/observability";
import { PILOT_STUDENT_GRADE } from "@/lib/pilot";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_RATE_LIMIT = {
  max: 20,
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

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const allowed = await consumeRateLimit(rateLimitBucketFromRequest(request, "signup"), SIGNUP_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "signup_rate_limited" }, { status: 429 });
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

    if (result.error && result.errorCode === "already_registered") {
      return NextResponse.json({ error: "already_registered" }, { status: 400 });
    }

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

    return NextResponse.json({
      ok: true,
      needsEmailConfirmation: result.needsEmailConfirmation,
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email
          }
        : null
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: metadata
    }
  });

  if (error) {
    logServerError("signup_failed", { channel: "public", detail: error.message.slice(0, 200) });
    return NextResponse.json(
      { error: isDuplicateSignupError(error.message) ? "already_registered" : "signup_failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    needsEmailConfirmation: !data.session,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email
        }
      : null
  });
}
