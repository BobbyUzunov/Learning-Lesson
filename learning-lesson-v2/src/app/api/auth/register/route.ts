import { NextResponse } from "next/server";
import { isSignupPasswordValid } from "@/lib/auth-password";
import { rateLimitBucketFromRequest } from "@/lib/http/client-ip";
import { readJsonObject } from "@/lib/http";
import { consumeRateLimit } from "@/lib/http/rate-limit";
import { PILOT_STUDENT_GRADE } from "@/lib/pilot";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_RATE_LIMIT = {
  max: 10,
  windowSeconds: 30 * 60
} as const;

function isAccountRole(value: unknown): value is "user" | "teacher" {
  return value === "user" || value === "teacher";
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const bucket = rateLimitBucketFromRequest(request, "auth-signup");
  const allowed = await consumeRateLimit(bucket, SIGNUP_RATE_LIMIT);
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

  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/verify-email`,
      data: {
        display_name: displayName || email.split("@")[0],
        intended_role: accountRole,
        grade_level: accountRole === "user" ? PILOT_STUDENT_GRADE : undefined,
        privacy_accepted_at: new Date().toISOString()
      }
    }
  });

  if (error) {
    return NextResponse.json({ error: "signup_failed", message: error.message }, { status: 400 });
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
