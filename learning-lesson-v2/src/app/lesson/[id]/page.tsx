import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MissionPanel } from "@/components/mission-panel";
import { QuizGenerator } from "@/components/quiz-generator";
import { getFirstGameLesson, getQuestForLesson, isLessonUnlocked, xpPerLesson } from "@/lib/game-data";
import { formatMessage, localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getLessonWithOverrides } from "@/lib/mission-content";

export const dynamic = "force-dynamic";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

function withProgressiveHints(
  lesson: {
    hint?: string;
    hint1?: string;
    hint2?: string;
    hint3?: string;
    mission: string;
    codeExample: string;
  },
  copy: ReturnType<typeof t>
) {
  const baseHint = lesson.hint1 ?? lesson.hint ?? copy.lesson.defaultHint;

  return {
    hint1: lesson.hint1 ?? baseHint,
    hint2: lesson.hint2 ?? `${baseHint} ${copy.lesson.defaultHint2}`,
    hint3:
      lesson.hint3 ??
      formatMessage(copy.lesson.defaultHint3, {
        codeExample: lesson.codeExample,
        mission: lesson.mission
      })
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const session = await getCurrentSession();
  const { id } = await params;
  const firstLesson = getFirstGameLesson();
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const completedLessonIds = progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id) ?? [];

  if (!session.user && id !== firstLesson.id) {
    redirect("/paths?guestLocked=1");
  }

  const gameLesson = await getLessonWithOverrides(id);

  if (!gameLesson) {
    notFound();
  }

  if (session.user && !isLessonUnlocked(id, completedLessonIds)) {
    redirect("/paths?lessonLocked=1");
  }

  const rawQuest = getQuestForLesson(gameLesson.id);
  const quest = rawQuest ? localizeGameQuest(rawQuest, language) : null;
  const localized = localizeGameLesson(gameLesson, language);
  const missionLesson = { ...localized, ...withProgressiveHints(localized, copy) };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        {copy.common.backToPaths}
      </Link>
      <article className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-violet">
              {quest?.title ?? copy.paths.badge} · {xpPerLesson} XP
            </p>
            <h1 className="mt-2 text-4xl font-black">{missionLesson.title}</h1>
            <p className="mt-3 text-ink/70">{missionLesson.explanation}</p>
          </div>
          <span className="w-fit rounded-md bg-mint/15 px-3 py-2 text-sm font-bold">{copy.lesson.mission}</span>
        </div>
        <section className="mt-8 rounded-lg border border-ink/10 bg-ink p-4 text-paper">
          <h2 className="font-black">{copy.lesson.codeExample}</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-black/20 p-4 text-sm leading-6">
            <code>{missionLesson.codeExample}</code>
          </pre>
        </section>
        <MissionPanel
          completedLessonIds={completedLessonIds}
          isAuthenticated={Boolean(session.user)}
          language={language}
          lesson={missionLesson}
        />
        <QuizGenerator language={language} lessonId={missionLesson.id} />
      </article>
    </main>
  );
}
