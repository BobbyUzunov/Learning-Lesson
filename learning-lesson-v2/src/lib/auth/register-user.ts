import type { SupabaseClient, User } from "@supabase/supabase-js";

type SignupMetadata = Record<string, unknown>;

export type RegisterUserResult = {
  user: User | null;
  needsEmailConfirmation: boolean;
  resendError?: string | null;
  error?: string | null;
  errorCode?: "signup_failed";
};

export function isDuplicateSignupError(message: string) {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("already been registered") ||
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  );
}

async function sendSignupConfirmationEmail(
  admin: SupabaseClient,
  email: string,
  redirectTo: string
) {
  return admin.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo }
  });
}

/**
 * Creates or resumes signup without revealing whether the email already exists.
 * Duplicate confirmed/unconfirmed accounts all look like a fresh confirmation flow.
 */
export async function registerUserWithAdmin(
  admin: SupabaseClient,
  {
    email,
    password,
    metadata,
    redirectTo
  }: {
    email: string;
    password: string;
    metadata: SignupMetadata;
    redirectTo: string;
  }
): Promise<RegisterUserResult> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: metadata
  });

  if (!error) {
    const resend = await sendSignupConfirmationEmail(admin, email, redirectTo);
    return {
      user: data.user,
      needsEmailConfirmation: true,
      resendError: resend.error?.message ?? null
    };
  }

  if (!isDuplicateSignupError(error.message)) {
    return { user: null, needsEmailConfirmation: false, error: error.message, errorCode: "signup_failed" };
  }

  // Do not call listUsers / probe confirmation state — that enables account enumeration.
  // Best-effort resend helps unconfirmed owners; failures stay server-side only.
  const resend = await sendSignupConfirmationEmail(admin, email, redirectTo);
  return {
    user: null,
    needsEmailConfirmation: true,
    resendError: resend.error?.message ?? null
  };
}
