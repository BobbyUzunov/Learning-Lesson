import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LessonStages } from "@/components/lesson-stages";
import { getCourseCatalog, getFirstLesson, getLessonFromCatalog, getQuestForLesson, isLessonUnlocked } from "@/lib/catalog";
import { formatMessage, localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { localizeLessonStructure } from "@/lib/lesson-structure";
import { getQuizContent } from "@/lib/quiz";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export const dynamic = "force-dynamic";

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
  const [language, session, { id }, catalog, quizContent] = await Promise.all([
    getLanguage(),
    getCurrentSession(),
    params,
    getCourseCatalog(),
    getQuizContent()
  ]);
  const copy = t(language);
  const firstLesson = getFirstLesson(catalog);
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const completedLessonIds = progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id) ?? [];

  if (!session.user && id !== firstLesson?.id) {
    redirect("/courses?guestLocked=1");
  }

  const gameLesson = getLessonFromCatalog(catalog, id);

  if (!gameLesson) {
    notFound();
  }

  if (session.user && !isLessonUnlocked(catalog, id, completedLessonIds)) {
    redirect("/courses?lessonLocked=1");
  }

  const rawQuest = getQuestForLesson(catalog, gameLesson.id);
  const quest = rawQuest ? localizeGameQuest(rawQuest, language) : null;
  const localized = localizeGameLesson(gameLesson, language);
  const missionLesson = { ...localized, ...withProgressiveHints(localized, copy) };
  const structure = localizeLessonStructure(localized, rawQuest ?? null, language);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        {copy.common.backToPaths}
      </Link>

      <LessonStages
        completedLessonIds={completedLessonIds}
        courses={catalog.courses}
        courseTitle={quest?.title ?? copy.paths.badge}
        isAuthenticated={Boolean(session.user)}
        language={language}
        lesson={missionLesson}
        quizContent={quizContent}
        structure={structure}
      />
    </main>
  );
}
