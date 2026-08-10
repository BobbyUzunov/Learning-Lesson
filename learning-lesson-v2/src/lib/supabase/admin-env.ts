import "server-only";

function getAdminSecretKey() {
  return process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

export function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && getAdminSecretKey());
}

export function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = getAdminSecretKey();

  if (!url || !secretKey) {
    throw new Error("Missing server-side Supabase configuration");
  }

  return { url, secretKey };
}
