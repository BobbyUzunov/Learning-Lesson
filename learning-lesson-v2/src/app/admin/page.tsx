import { lessons, learningPaths } from "@/lib/data";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase text-coral">Admin MVP</p>
        <h1 className="mt-2 text-4xl font-black">Lessons admin</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Read-only lesson management shell. Next step: protect this route and add Supabase CRUD.
        </p>
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-ink/10 bg-white/80">
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
    </main>
  );
}
