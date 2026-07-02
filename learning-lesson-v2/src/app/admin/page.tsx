import {
  gameLessons,
  gameQuests,
  getLessonOrderInQuest,
  getLessonUnlockRule,
  getQuestLessons,
  getTotalAvailableXp,
  xpPerLesson
} from "@/lib/game-data";
import { localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function AdminPage() {
  const language = await getLanguage();
  const copy = t(language);
  const quests = gameQuests.map((quest) => localizeGameQuest(quest, language));
  const localizedLessons = gameLessons.map((lesson) => localizeGameLesson(lesson, language));

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-coral">{copy.admin.protected}</p>
        <h1 className="mt-2 text-4xl font-black">{copy.admin.title}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.subtitle}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.quests}</p>
          <p className="mt-2 text-3xl font-black">{quests.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.lessons}</p>
          <p className="mt-2 text-3xl font-black">{gameLessons.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.totalXp}</p>
          <p className="mt-2 text-3xl font-black">{getTotalAvailableXp()}</p>
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-xl font-black">{copy.admin.questCoverage}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {quests.map((quest) => {
            const questLessons = getQuestLessons(quest.id);
            return (
              <div className="rounded-lg border border-ink/10 p-4" key={quest.id}>
                <h3 className="font-bold">{quest.title}</h3>
                <p className="mt-2 text-sm text-ink/70">
                  {questLessons.length} {copy.dashboard.lessons} · {quest.levels} {copy.paths.levels} {copy.admin.planned}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">{copy.admin.lesson}</th>
              <th className="px-4 py-3">{copy.admin.quest}</th>
              <th className="px-4 py-3">{copy.admin.order}</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">{copy.admin.unlockRule}</th>
            </tr>
          </thead>
          <tbody>
            {localizedLessons.map((lesson) => {
              const unlockRule = getLessonUnlockRule(lesson.id);
              const quest = quests.find((item) => item.id === lesson.questId);

              return (
                <tr className="border-t border-ink/10" key={lesson.id}>
                  <td className="px-4 py-3 font-bold">{lesson.title}</td>
                  <td className="px-4 py-3">{quest?.title}</td>
                  <td className="px-4 py-3">{getLessonOrderInQuest(lesson.id)}</td>
                  <td className="px-4 py-3">{xpPerLesson}</td>
                  <td className="px-4 py-3">{unlockRule ?? copy.admin.open}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
