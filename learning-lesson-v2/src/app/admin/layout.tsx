import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const language = await getLanguage();
  const copy = t(language);
  const session = await requireAdmin();
  const email = session.user.email;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-lg border border-ink/10 bg-white/80 p-4">
        <p className="text-xs font-bold uppercase text-ink/50">{copy.nav.admin}</p>
        <p className="mt-2 break-words text-sm font-bold">{email}</p>
        <nav className="mt-5 grid gap-2 text-sm font-bold">
          <Link className="rounded-md bg-ink px-3 py-2 text-paper" href="/admin">
            {copy.admin.cmsNav}
          </Link>
          <Link className="rounded-md px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink" href="/admin/reviews">
            {copy.admin.reviewsNav}
          </Link>
          <Link className="rounded-md px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink" href="/paths">
            {copy.admin.viewPaths}
          </Link>
          <Link className="rounded-md px-3 py-2 text-ink/70 hover:bg-ink/5 hover:text-ink" href="/dashboard">
            {copy.nav.dashboard}
          </Link>
        </nav>
      </aside>
      <div>{children}</div>
    </main>
  );
}
