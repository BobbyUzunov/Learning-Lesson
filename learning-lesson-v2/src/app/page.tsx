import Link from "next/link";
import { ArrowRight, Trophy, Route, ShieldCheck } from "lucide-react";
import { ContinueLearningButton } from "@/components/continue-learning-button";
import { gameQuests } from "@/lib/game-data";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

const questColors = ["bg-mint", "bg-coral", "bg-violet", "bg-mint", "bg-coral", "bg-violet"];

export default async function HomePage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await getCurrentSession();
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const quests = gameQuests.slice(0, 3).map((quest) => localizeGameQuest(quest, language));
  const icons = [Route, Trophy, ShieldCheck];

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <p className="text-sm font-bold uppercase text-coral">{copy.home.badge}</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">{copy.home.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            {copy.home.subtitle}
          </p>
          {session.user ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ContinueLearningButton
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-bold text-paper transition hover:bg-ink/90"
                completedLessonIds={progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id)}
                label={copy.home.continueLearning}
              />
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 px-5 py-3 font-bold transition hover:bg-white/70"
                href="/dashboard"
              >
                {copy.nav.dashboard}
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-bold text-paper transition hover:bg-ink/90"
                href="/register"
              >
                {copy.nav.register}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 px-5 py-3 font-bold transition hover:bg-white/70"
                href="/login"
              >
                {copy.nav.login}
              </Link>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/75 p-5 shadow-soft">
          <div className="grid gap-3">
            {quests.map((quest, index) => (
              <Link
                className="group rounded-lg border border-ink/10 bg-paper/70 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                href="/paths"
                key={quest.id}
              >
                <div className="flex items-center gap-3">
                  <span className={`size-3 rounded-full ${questColors[index % questColors.length]}`} />
                  <h2 className="font-bold">{quest.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/70">{quest.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-ink/10 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          {copy.home.features.map((item, index) => {
            const Icon = icons[index];
            return (
            <div className="rounded-lg p-4" key={item.title}>
              <Icon className="size-6 text-violet" />
              <h3 className="mt-3 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{item.text}</p>
            </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
