export type AuthErrorLabels = {
  passwordPolicy: string;
  passwordTooShort: string;
  alreadyRegistered: string;
  invalidCredentials: string;
  emailNotConfirmed: string;
  invalidEmail: string;
  rateLimited: string;
  passwordSameAsOld: string;
};

function normalizeAuthMessage(message: string) {
  return message.trim().replace(/\s+/g, " ").toLowerCase();
}

export function mapAuthErrorMessage(message: string, labels: AuthErrorLabels): string {
  const normalized = normalizeAuthMessage(message);

  if (normalized.includes("password should contain at least one character of each")) {
    return labels.passwordPolicy;
  }

  if (normalized.includes("password should be at least") || normalized.includes("password is too short")) {
    return labels.passwordTooShort;
  }

  if (normalized.includes("user already registered") || normalized.includes("already been registered")) {
    return labels.alreadyRegistered;
  }

  if (normalized.includes("invalid login credentials")) {
    return labels.invalidCredentials;
  }

  if (normalized.includes("email not confirmed")) {
    return labels.emailNotConfirmed;
  }

  if (normalized.includes("unable to validate email") || normalized.includes("invalid email")) {
    return labels.invalidEmail;
  }

  if (
    normalized.includes("email rate limit") ||
    normalized.includes("over_email_send_rate_limit") ||
    normalized.includes("for security purposes") ||
    normalized.includes("you can only request this after")
  ) {
    return labels.rateLimited;
  }

  if (normalized.includes("new password should be different")) {
    return labels.passwordSameAsOld;
  }

  return message.trim();
}
