import Link from "next/link";
import { DashboardGameSummary } from "@/components/dashboard-game-summary";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { requireUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  await requireUser();
  const { progress, userEmail, isDemo } = await getCurrentUserProgress();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-coral">
            {userEmail ?? (isDemo ? copy.dashboard.demo : "Game MVP")}
          </p>
          <h1 className="mt-2 text-4xl font-black">{copy.dashboard.title}</h1>
          <p className="mt-3 max-w-2xl text-ink/70">
            {copy.dashboard.subtitle}
          </p>
        </div>
        <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/paths">
          {copy.dashboard.chooseQuest}
        </Link>
      </div>

      <DashboardGameSummary initialProgress={progress} language={language} />
    </main>
  );
}
