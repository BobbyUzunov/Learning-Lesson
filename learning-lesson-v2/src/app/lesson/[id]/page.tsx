import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MissionPanel } from "@/components/mission-panel";
import { getLesson } from "@/lib/data";
import { getGameLesson, getQuestForLesson } from "@/lib/game-data";
import { getLessonExample } from "@/lib/learning";
import { localizeLesson, localizePath, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getPathById } from "@/lib/learning";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const gameLesson = getGameLesson(id);
  const rawLegacyLesson = getLesson(id);

  if (!gameLesson && !rawLegacyLesson) {
    notFound();
  }

  const legacyLesson = rawLegacyLesson ? localizeLesson(rawLegacyLesson, language) : null;
  const quest = gameLesson ? getQuestForLesson(gameLesson.id) : null;
  const rawPath = legacyLesson ? getPathById(legacyLesson.pathId) : null;
  const path = rawPath ? localizePath(rawPath, language) : null;
  const missionLesson =
    gameLesson ??
    (legacyLesson
      ? {
          id: legacyLesson.id,
          questId: legacyLesson.pathId,
          title: legacyLesson.title,
          explanation: legacyLesson.content,
          codeExample: getLessonExample(legacyLesson.id),
          mission: "Apply the main idea from this lesson in a small example.",
          hint: "Keep the example small and focus on one concept.",
          solution: getLessonExample(legacyLesson.id)
        }
      : null);

  if (!missionLesson) {
    notFound();
  }

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
              {quest?.title ?? path?.title ?? copy.paths.badge} · 100 XP
            </p>
            <h1 className="mt-2 text-4xl font-black">{missionLesson.title}</h1>
            <p className="mt-3 text-ink/70">{missionLesson.explanation}</p>
          </div>
          <span className="w-fit rounded-md bg-mint/15 px-3 py-2 text-sm font-bold">Mission</span>
        </div>
        <section className="mt-8 rounded-lg border border-ink/10 bg-ink p-4 text-paper">
          <h2 className="font-black">Code Example</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-black/20 p-4 text-sm leading-6">
            <code>{missionLesson.codeExample}</code>
          </pre>
        </section>
        <MissionPanel lesson={missionLesson} />
      </article>
    </main>
  );
}
