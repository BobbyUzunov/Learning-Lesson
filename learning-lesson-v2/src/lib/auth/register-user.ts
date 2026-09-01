import type { SupabaseClient, User } from "@supabase/supabase-js";

type SignupMetadata = Record<string, unknown>;

export type RegisterUserResult = {
  user: User | null;
  needsEmailConfirmation: boolean;
  resendError?: string | null;
  error?: string | null;
  errorCode?: "already_registered" | "signup_failed";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isDuplicateSignupError(message: string) {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("already been registered") ||
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  );
}

async function findUserByEmail(admin: SupabaseClient, email: string) {
  const target = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return { user: null as User | null, error };
    }

    const user = data.users.find((entry) => normalizeEmail(entry.email ?? "") === target) ?? null;
    if (user) {
      return { user, error: null };
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return { user: null, error: null };
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

  const { user: existing, error: lookupError } = await findUserByEmail(admin, email);
  if (lookupError) {
    return {
      user: null,
      needsEmailConfirmation: false,
      error: lookupError.message,
      errorCode: "signup_failed"
    };
  }

  if (!existing || existing.email_confirmed_at) {
    return {
      user: null,
      needsEmailConfirmation: false,
      error: "already_registered",
      errorCode: "already_registered"
    };
  }

  // Never overwrite the password or metadata of an unconfirmed account. A second
  // person who types the same email must not take over the inbox before confirm.
  const resend = await sendSignupConfirmationEmail(admin, email, redirectTo);
  if (resend.error) {
    return {
      user: null,
      needsEmailConfirmation: true,
      error: resend.error.message,
      errorCode: "signup_failed"
    };
  }

  return { user: null, needsEmailConfirmation: true, resendError: null };
}
