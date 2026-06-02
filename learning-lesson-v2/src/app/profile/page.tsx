import Link from "next/link";
import { UserCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { requireUser } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export default async function ProfilePage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await requireUser();
  const { progress } = await getCurrentUserProgress();
  const completedCount = progress.filter((item) => item.completed).length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <section className="rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
        <UserCircle className="size-10 text-violet" />
        <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.nav.profile}</p>
        <h1 className="mt-2 break-words text-4xl font-black">{session.user.email}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.userLevel}</p>
            <p className="mt-2 text-3xl font-black">{session.profile?.level ?? 1}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.totalXp}</p>
            <p className="mt-2 text-3xl font-black">{session.profile?.xp ?? 0}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.lessonsCompleted}</p>
            <p className="mt-2 text-3xl font-black">{completedCount}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/dashboard">
            {copy.nav.dashboard}
          </Link>
          <Link className="rounded-md border border-ink/15 px-4 py-3 text-center font-bold" href="/paths">
            {copy.nav.paths}
          </Link>
        </div>
      </section>
    </main>
  );
}
