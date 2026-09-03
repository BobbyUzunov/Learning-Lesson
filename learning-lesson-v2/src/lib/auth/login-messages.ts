import type { t } from "@/lib/i18n";

export const LOGIN_MESSAGE_KEYS = ["admin_allowlist", "account_deleted", "login_required"] as const;

export type LoginMessageKey = (typeof LOGIN_MESSAGE_KEYS)[number];

export function isLoginMessageKey(value: string | undefined): value is LoginMessageKey {
  return LOGIN_MESSAGE_KEYS.includes(value as LoginMessageKey);
}

type Copy = ReturnType<typeof t>;

export function resolveLoginMessage(message: string | undefined, copy: Copy): string | null {
  if (!message || !isLoginMessageKey(message)) {
    return null;
  }

  switch (message) {
    case "admin_allowlist":
      return copy.admin.allowlistMessage;
    case "account_deleted":
      return copy.login.accountDeletedMessage;
    case "login_required":
      return copy.login.loginRequiredMessage;
    default:
      return null;
  }
}
