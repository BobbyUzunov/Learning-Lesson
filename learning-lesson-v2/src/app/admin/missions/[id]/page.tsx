import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminMissionEditor } from "@/components/admin-mission-editor";
import { getQuestForLesson } from "@/lib/game-data";
import { localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getLessonWithOverrides } from "@/lib/mission-content";

type AdminMissionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMissionPage({ params }: AdminMissionPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const lesson = await getLessonWithOverrides(id);

  if (!lesson) {
    notFound();
  }

  const quest = getQuestForLesson(lesson.id);
  const localizedLesson = localizeGameLesson(lesson, language);
  const localizedQuest = quest ? localizeGameQuest(quest, language) : null;

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin">
        ← {copy.admin.lessons}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.editMission}</p>
      <h1 className="mt-2 text-4xl font-black">{localizedLesson.title}</h1>
      <p className="mt-2 text-sm text-ink/70">
        {copy.admin.quest}: {localizedQuest?.title ?? lesson.questId} · ID {lesson.id}
      </p>
      <AdminMissionEditor language={language} lesson={lesson} />
    </div>
  );
}
