import Link from "next/link";
import { DashboardGameSummary } from "@/components/dashboard-game-summary";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  const { userEmail, isDemo } = await getCurrentUserProgress();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-coral">
            {userEmail ?? (isDemo ? copy.dashboard.demo : "Game MVP")}
          </p>
          <h1 className="mt-2 text-4xl font-black">{copy.dashboard.title}</h1>
          <p className="mt-3 max-w-2xl text-ink/70">
            Track your level, XP, current quest, mission progress and streak.
          </p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/paths">
          Choose Quest
        </Link>
      </div>

      <DashboardGameSummary />

      <section className="mt-6 rounded-lg border border-ink/10 bg-white/70 p-4 text-sm leading-6 text-ink/70">
        TODO Supabase Auth: replace localStorage progress with per-user Supabase progress after auth and profile roles are finalized.
      </section>
    </main>
  );
}
