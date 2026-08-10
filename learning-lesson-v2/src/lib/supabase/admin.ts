import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "./admin-env";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv();

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
