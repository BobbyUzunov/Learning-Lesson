import { NextResponse } from "next/server";
import { isSignupPasswordValid } from "@/lib/auth-password";
import { readJsonObject } from "@/lib/http";
import { PILOT_STUDENT_GRADE } from "@/lib/pilot";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

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

  const origin = new URL(request.url).origin;
  const metadata = buildSignupMetadata(email, displayName, accountRole);

  if (hasSupabaseAdminEnv()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: metadata
    });

    if (error) {
      return NextResponse.json({ error: "signup_failed", message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      needsEmailConfirmation: true,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email
          }
        : null
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/verify-email`,
      data: metadata
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
