import { lessons, learningPaths } from "@/lib/data";
import { getPathLessons } from "@/lib/data";

export default function AdminPage() {
  const totalXp = lessons.reduce((sum, lesson) => sum + lesson.xp, 0);

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase text-coral">Protected admin</p>
        <h1 className="mt-2 text-4xl font-black">Lessons admin</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Manage the MVP lesson blueprint, unlock order, XP values, and path coverage.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">Paths</p>
          <p className="mt-2 text-3xl font-black">{learningPaths.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">Lessons</p>
          <p className="mt-2 text-3xl font-black">{lessons.length}</p>
        </div>
        <div className="rounded-lg bg-white/80 p-4">
          <p className="text-sm text-ink/60">Total XP</p>
          <p className="mt-2 text-3xl font-black">{totalXp}</p>
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-xl font-black">Path coverage</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {learningPaths.map((path) => {
            const pathLessons = getPathLessons(path.id);
            return (
              <div className="rounded-lg border border-ink/10 p-4" key={path.id}>
                <div className="flex items-center gap-2">
                  <span className={`size-3 rounded-full ${path.color}`} />
                  <h3 className="font-bold">{path.title}</h3>
                </div>
                <p className="mt-2 text-sm text-ink/70">{pathLessons.length} lessons</p>
              </div>
            );
          })}
        </div>
      </section>
      <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Unlock rule</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr className="border-t border-ink/10" key={lesson.id}>
                <td className="px-4 py-3 font-bold">{lesson.title}</td>
                <td className="px-4 py-3">{learningPaths.find((path) => path.id === lesson.pathId)?.title}</td>
                <td className="px-4 py-3">{lesson.order}</td>
                <td className="px-4 py-3">{lesson.xp}</td>
                <td className="px-4 py-3">{lesson.lockedBy ?? "Open"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
