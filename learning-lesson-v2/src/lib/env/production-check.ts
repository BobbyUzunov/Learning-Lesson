import { parseAdminEmailAllowlist } from "@/lib/supabase/admin-allowlist";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";

function isVercelDeployment() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV?.trim());
}

function isVercelProduction() {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Fail fast for dangerous/misconfigured deployments.
 * Secret/allowlist checks run only on Vercel production — not CI `next start`
 * (NODE_ENV=production with placeholder Supabase env).
 */
export function assertProductionEnv() {
  if (isVercelDeployment() && process.env.E2E_FAKE_AUTH === "1") {
    throw new Error("E2E_FAKE_AUTH must not be enabled on Vercel deployments");
  }

  if (!isVercelProduction()) {
    return;
  }

  if (!hasSupabaseAdminEnv()) {
    throw new Error("Production requires SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }

  if (parseAdminEmailAllowlist().length === 0) {
    throw new Error("Production requires ADMIN_EMAIL_ALLOWLIST");
  }
}
