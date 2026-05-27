import { lessons, learningPaths } from "@/lib/data";
import { getPathLessons } from "@/lib/data";
import { localizeLesson, localizePath, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function AdminPage() {
  const language = await getLanguage();
  const copy = t(language);
  const totalXp = lessons.reduce((sum, lesson) => sum + lesson.xp, 0);
  const paths = learningPaths.map((path) => localizePath(path, language));
  const localizedLessons = lessons.map((lesson) => localizeLesson(lesson, language));

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-coral">{copy.admin.protected}</p>
        <h1 className="mt-2 text-4xl font-black">{copy.admin.title}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.subtitle}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.paths}</p>
          <p className="mt-2 text-3xl font-black">{paths.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.lessons}</p>
          <p className="mt-2 text-3xl font-black">{lessons.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">{copy.admin.totalXp}</p>
          <p className="mt-2 text-3xl font-black">{totalXp}</p>
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-xl font-black">{copy.admin.pathCoverage}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {paths.map((path) => {
            const pathLessons = getPathLessons(path.id);
            return (
              <div className="rounded-lg border border-ink/10 p-4" key={path.id}>
                <div className="flex items-center gap-2">
                  <span className={`size-3 rounded-full ${path.color}`} />
                  <h3 className="font-bold">{path.title}</h3>
                </div>
                <p className="mt-2 text-sm text-ink/70">
                  {pathLessons.length} {copy.dashboard.lessons}
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
              <th className="px-4 py-3">{copy.admin.path}</th>
              <th className="px-4 py-3">{copy.admin.order}</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">{copy.admin.unlockRule}</th>
            </tr>
          </thead>
          <tbody>
            {localizedLessons.map((lesson) => (
              <tr className="border-t border-ink/10" key={lesson.id}>
                <td className="px-4 py-3 font-bold">{lesson.title}</td>
                <td className="px-4 py-3">{paths.find((path) => path.id === lesson.pathId)?.title}</td>
                <td className="px-4 py-3">{lesson.order}</td>
                <td className="px-4 py-3">{lesson.xp}</td>
                <td className="px-4 py-3">{lesson.lockedBy ?? copy.admin.open}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
