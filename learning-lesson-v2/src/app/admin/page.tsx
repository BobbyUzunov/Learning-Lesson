import Link from "next/link";
import { AdminSeedButton } from "@/components/admin-seed-button";
import {
  getCourseCatalog,
  getCatalogLessons,
  getLessonOrderInQuest,
  getLessonUnlockRule,
  getQuestLessons,
  getTotalAvailableXp
} from "@/lib/catalog";
import { xpPerLesson } from "@/lib/game-data";
import { getCourseProjects } from "@/lib/projects/store";
import { getQuizContent } from "@/lib/quiz";
import { localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const language = await getLanguage();
  const copy = t(language);
  const catalog = await getCourseCatalog();
  const [{ projects }, quiz] = await Promise.all([getCourseProjects(), getQuizContent()]);
  const quests = catalog.courses.map((quest) => localizeGameQuest(quest, language));
  const lessons = await getCatalogLessons();
  const localizedLessons = lessons.map((lesson) => localizeGameLesson(lesson, language));

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-coral">{copy.admin.protected}</p>
        <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.cmsTitle}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.cmsSubtitle}</p>
        <p className="mt-3 inline-flex rounded-md bg-ink/5 px-3 py-2 text-xs font-bold uppercase text-ink/60">
          {copy.admin.catalogSource}: {catalog.source === "db" ? copy.admin.catalogDb : copy.admin.catalogFallback}
        </p>
      </div>

      <AdminSeedButton language={language} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.courses}</p>
          <p className="mt-2 text-3xl font-black">{quests.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.lessons}</p>
          <p className="mt-2 text-3xl font-black">{lessons.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.quizQuestionsCount}</p>
          <p className="mt-2 text-3xl font-black">{quiz.questions.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.projectsNav}</p>
          <p className="mt-2 text-3xl font-black">{projects.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.totalXp}</p>
          <p className="mt-2 text-3xl font-black">{getTotalAvailableXp(catalog, xpPerLesson)}</p>
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-xl font-black">{copy.admin.contentSections}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper" href="/admin/projects">
            {copy.admin.projectsNav}
          </Link>
          <Link className="rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink" href="/admin/quiz">
            {copy.admin.quizNav}
          </Link>
          <Link className="rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink" href="/admin/reviews">
            {copy.admin.reviewsNav}
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-xl font-black">{copy.admin.courses}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {quests.map((quest) => {
            const questLessons = getQuestLessons(catalog, quest.id);
            return (
              <div className="rounded-lg border border-ink/10 p-4" key={quest.id}>
                <h3 className="font-bold">{quest.title}</h3>
                <p className="mt-2 text-sm text-ink/70">
                  {questLessons.length} {copy.dashboard.lessons} · {quest.estimatedTime}
                </p>
                <Link className="mt-4 inline-flex text-sm font-bold text-violet hover:underline" href={`/admin/courses/${quest.id}`}>
                  {copy.admin.editCourse}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">{copy.admin.lesson}</th>
              <th className="px-4 py-3">{copy.admin.quest}</th>
              <th className="px-4 py-3">{copy.admin.order}</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">{copy.admin.unlockRule}</th>
              <th className="px-4 py-3">{copy.admin.editMission}</th>
            </tr>
          </thead>
          <tbody>
            {localizedLessons.map((lesson) => {
              const unlockRule = getLessonUnlockRule(catalog, lesson.id);
              const quest = quests.find((item) => item.id === lesson.questId);

              return (
                <tr className="border-t border-ink/10" key={lesson.id}>
                  <td className="px-4 py-3 font-bold">{lesson.title}</td>
                  <td className="px-4 py-3">{quest?.title}</td>
                  <td className="px-4 py-3">{getLessonOrderInQuest(catalog, lesson.id)}</td>
                  <td className="px-4 py-3">{xpPerLesson}</td>
                  <td className="px-4 py-3">{unlockRule ?? copy.admin.open}</td>
                  <td className="px-4 py-3">
                    <a className="font-bold text-violet hover:underline" href={`/admin/missions/${lesson.id}`}>
                      {copy.admin.editMission}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
