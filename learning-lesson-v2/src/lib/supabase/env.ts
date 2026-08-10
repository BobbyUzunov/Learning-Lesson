const placeholderUrls = new Set(["https://example.supabase.co", "https://your-project.supabase.co"]);
const placeholderAnonKeys = new Set(["example-anon-key", "your-anon-key"]);

function readSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  };
}

export function hasSupabaseEnv() {
  const { url, anonKey } = readSupabaseEnv();
  return Boolean(
    url &&
      anonKey &&
      !placeholderUrls.has(url.replace(/\/$/, "")) &&
      !placeholderAnonKeys.has(anonKey)
  );
}

export function getSupabaseEnv() {
  const { url, anonKey } = readSupabaseEnv();

  if (!hasSupabaseEnv()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}
