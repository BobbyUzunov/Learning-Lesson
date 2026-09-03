import { parseAdminEmailAllowlist } from "@/lib/supabase/admin-allowlist";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";

function isProductionRuntime() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

function isVercelDeployment() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV?.trim());
}

/** Fail fast when deployed/production env is misconfigured. */
export function assertProductionEnv() {
  if (isVercelDeployment() && process.env.E2E_FAKE_AUTH === "1") {
    throw new Error("E2E_FAKE_AUTH must not be enabled on Vercel deployments");
  }

  if (!isProductionRuntime()) {
    return;
  }

  if (!hasSupabaseAdminEnv()) {
    throw new Error("Production requires SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }

  if (parseAdminEmailAllowlist().length === 0) {
    throw new Error("Production requires ADMIN_EMAIL_ALLOWLIST");
  }
}
