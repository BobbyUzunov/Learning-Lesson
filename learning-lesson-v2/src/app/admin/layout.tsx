import { requireAdmin } from "@/lib/supabase/auth";

/** Auth gate only — primary admin nav lives in the site header. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>;
}
