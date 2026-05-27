import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function getAdminSession() {
  if (!hasSupabaseEnv()) {
    return { email: null, configured: false, allowed: false };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const allowed = email ? adminEmails.length === 0 || adminEmails.includes(email.toLowerCase()) : false;

  return { email, configured: true, allowed };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email, configured, allowed } = await getAdminSession();

  if (!configured || !email || !allowed) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
          <LockKeyhole className="size-8 text-violet" />
          <h1 className="mt-4 text-3xl font-black">{email ? "Admin permission required" : "Admin access required"}</h1>
          <p className="mt-3 leading-7 text-ink/70">
            {email
              ? "Your account is signed in, but it is not included in the admin allowlist."
              : "The admin area is protected by Supabase Auth. Sign in before managing lessons and paths."}
          </p>
          {!email ? (
            <Link className="mt-6 inline-flex rounded-md bg-ink px-4 py-3 font-bold text-paper" href="/login">
              Go to login
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-lg border border-ink/10 bg-white/80 p-4">
        <p className="text-xs font-bold uppercase text-ink/50">Admin</p>
        <p className="mt-2 break-words text-sm font-bold">{email}</p>
        <nav className="mt-5 grid gap-2 text-sm font-bold">
          <Link className="rounded-md bg-ink px-3 py-2 text-paper" href="/admin">
            Lessons
          </Link>
          <Link className="rounded-md px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink" href="/paths">
            View paths
          </Link>
          <Link className="rounded-md px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </aside>
      <div>{children}</div>
    </main>
  );
}
