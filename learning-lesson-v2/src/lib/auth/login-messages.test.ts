import { describe, expect, it } from "vitest";
import { isLoginMessageKey, resolveLoginMessage } from "./login-messages";
import { t } from "@/lib/i18n";

describe("login message allowlist", () => {
  it("accepts known keys only", () => {
    expect(isLoginMessageKey("login_required")).toBe(true);
    expect(isLoginMessageKey("account_deleted")).toBe(true);
    expect(isLoginMessageKey("admin_allowlist")).toBe(true);
    expect(isLoginMessageKey("arbitrary phishing text")).toBe(false);
    expect(isLoginMessageKey(undefined)).toBe(false);
  });

  it("resolves localized copy for known keys", () => {
    const copy = t("en");
    expect(resolveLoginMessage("login_required", copy)).toBe(copy.login.loginRequiredMessage);
    expect(resolveLoginMessage("account_deleted", copy)).toBe(copy.login.accountDeletedMessage);
    expect(resolveLoginMessage("admin_allowlist", copy)).toBe(copy.admin.allowlistMessage);
  });

  it("returns null for unknown query values", () => {
    const copy = t("en");
    expect(resolveLoginMessage("<script>alert(1)</script>", copy)).toBeNull();
    expect(resolveLoginMessage("Please login to continue your learning journey.", copy)).toBeNull();
  });
});
