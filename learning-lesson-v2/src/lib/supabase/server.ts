import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. Middleware can refresh sessions later.
        }
      }
    }
  });
}
