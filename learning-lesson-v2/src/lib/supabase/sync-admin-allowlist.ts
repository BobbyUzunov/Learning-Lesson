import "server-only";
import { parseAdminEmailAllowlist } from "./admin-allowlist";
import { hasSupabaseAdminEnv } from "./admin-env";
import { createAdminClient } from "./admin";
import { logServerError } from "@/lib/observability";

/**
 * Pushes ADMIN_EMAIL_ALLOWLIST into private.admin_emails so private.is_admin
 * matches the Next.js gate for direct Supabase JWT access.
 * Empty env list clears the table (role-only admin for local/dev).
 */
export async function syncAdminEmailAllowlist(
  emails: string[] = parseAdminEmailAllowlist()
): Promise<{ ok: boolean; count: number }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, count: 0 };
  }

  try {
    const { data, error } = await createAdminClient().rpc("replace_admin_emails", {
      p_emails: emails
    });

    if (error) {
      logServerError("admin_allowlist_sync_failed", { detail: error.message.slice(0, 200) });
      return { ok: false, count: 0 };
    }

    return { ok: true, count: typeof data === "number" ? data : emails.length };
  } catch (error) {
    logServerError("admin_allowlist_sync_failed", {
      detail: error instanceof Error ? error.message.slice(0, 200) : "unknown"
    });
    return { ok: false, count: 0 };
  }
}
