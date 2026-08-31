import type { SupabaseClient, User } from "@supabase/supabase-js";

type SignupMetadata = Record<string, unknown>;

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
) {
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
    return { user: null, needsEmailConfirmation: false, error: error.message };
  }

  const { user: existing, error: lookupError } = await findUserByEmail(admin, email);
  if (lookupError) {
    return { user: null, needsEmailConfirmation: false, error: lookupError.message };
  }

  if (!existing) {
    return { user: null, needsEmailConfirmation: false, error: error.message };
  }

  if (existing.email_confirmed_at) {
    return { user: null, needsEmailConfirmation: false, error: error.message };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    user_metadata: { ...existing.user_metadata, ...metadata }
  });

  if (updateError) {
    return { user: null, needsEmailConfirmation: false, error: updateError.message };
  }

  const resend = await sendSignupConfirmationEmail(admin, email, redirectTo);
  if (resend.error) {
    return { user: existing, needsEmailConfirmation: true, error: resend.error.message };
  }

  return { user: existing, needsEmailConfirmation: true, resendError: null };
}
