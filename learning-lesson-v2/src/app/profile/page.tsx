import Link from "next/link";
import { Award, Route, UserCircle } from "lucide-react";
import { DailyStreakCard } from "@/components/daily-streak-card";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { requireUser } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getAchievements, getGameProgressStats, toGameProgress } from "@/lib/game-progress";
import { localizeGameQuest } from "@/lib/i18n";

export default async function ProfilePage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await requireUser();
  const { progress, streakCount } = await getCurrentUserProgress();
  const gameProgress = toGameProgress(progress, streakCount);
  const stats = getGameProgressStats(gameProgress);
  const completedCount = stats.completedCount;
  const currentPath = localizeGameQuest(stats.currentQuest, language);
  const achievements = getAchievements(gameProgress, language, stats.currentStreak);
  const name = session.profile?.email?.split("@")[0] ?? session.user.email?.split("@")[0] ?? "Learner";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
        <UserCircle className="size-10 text-violet" />
        <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.nav.profile}</p>
        <h1 className="mt-2 break-words text-4xl font-black">{name}</h1>
        <p className="mt-2 break-words text-sm font-bold text-ink/60">{session.user.email}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.userLevel}</p>
            <p className="mt-2 text-3xl font-black">{stats.level}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.totalXp}</p>
            <p className="mt-2 text-3xl font-black">{stats.xp}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.lessonsCompleted}</p>
            <p className="mt-2 text-3xl font-black">{completedCount}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <p className="text-sm font-bold text-ink/60">{copy.dashboard.levelProgress}</p>
            <p className="mt-2 text-3xl font-black">{stats.xpPercent}%</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <DailyStreakCard initialStreak={stats.currentStreak} isAuthenticated language={language} />
          <section className="rounded-lg border border-ink/10 bg-paper/70 p-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
              <Route className="size-4 text-violet" />
              {copy.dashboard.currentPath}
            </div>
            <h2 className="mt-2 text-2xl font-black">{currentPath.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{currentPath.description}</p>
          </section>
        </div>
        <section className="mt-6 rounded-lg border border-ink/10 bg-paper/70 p-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
            <Award className="size-4 text-coral" />
            {copy.dashboard.achievements}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <div
                className={`rounded-lg border p-3 ${
                  achievement.unlocked ? "border-mint/30 bg-mint/15" : "border-ink/10 bg-white/60 text-ink/45"
                }`}
                key={achievement.id}
              >
                <p className="font-black">{achievement.title}</p>
                <p className="mt-1 text-xs leading-5">{achievement.description}</p>
              </div>
            ))}
          </div>
        </section>
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
