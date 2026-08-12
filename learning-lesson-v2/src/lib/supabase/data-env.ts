import { isE2eAuthEnabled } from "./e2e-auth";
import { hasSupabaseEnv } from "./env";

/** Keep fake-auth browser tests isolated from any configured remote Supabase project. */
export function hasSupabaseDataEnv() {
  return hasSupabaseEnv() && !isE2eAuthEnabled();
}
