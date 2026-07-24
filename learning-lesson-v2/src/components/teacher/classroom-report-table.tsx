import { t, type Language } from "@/lib/i18n";
import type { ClassroomReportRow, ClassroomReportSummary } from "@/lib/classrooms/types";

function formatDate(value: string | null, language: Language, fallback: string) {
  if (!value) {
    return fallback;
  }
  return new Date(value).toLocaleDateString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function ClassroomReportTable({
  language,
  rows,
  summary
}: {
  language: Language;
  rows: ClassroomReportRow[];
  summary: ClassroomReportSummary;
}) {
  const copy = t(language);

  return (
    <section className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
      <h2 className="text-xl font-black">{copy.teacher.reportTitle}</h2>
      <p className="mt-2 text-sm text-ink/70">{copy.teacher.reportSubtitle}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-ink/5 p-4">
          <p className="text-sm text-ink/60">{copy.teacher.summaryStudents}</p>
          <p className="mt-1 text-2xl font-black">{summary.studentCount}</p>
        </div>
        <div className="rounded-lg bg-ink/5 p-4">
          <p className="text-sm text-ink/60">{copy.teacher.summaryAvgLessons}</p>
          <p className="mt-1 text-2xl font-black">{summary.averageCompletedLessons}</p>
        </div>
        <div className="rounded-lg bg-ink/5 p-4">
          <p className="text-sm text-ink/60">{copy.teacher.summaryAvgXp}</p>
          <p className="mt-1 text-2xl font-black">{summary.averageXp}</p>
        </div>
        <div className="rounded-lg bg-ink/5 p-4">
          <p className="text-sm text-ink/60">{copy.teacher.summaryActiveToday}</p>
          <p className="mt-1 text-2xl font-black">{summary.activeToday}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-md bg-ink/5 px-4 py-3 text-sm text-ink/70">{copy.teacher.noStudents}</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-4 py-3">{copy.teacher.colStudent}</th>
                <th className="px-4 py-3">{copy.teacher.colCompleted}</th>
                <th className="px-4 py-3">{copy.teacher.colXp}</th>
                <th className="px-4 py-3">{copy.teacher.colLevel}</th>
                <th className="px-4 py-3">{copy.teacher.colLastVisit}</th>
                <th className="px-4 py-3">{copy.teacher.colJoined}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-ink/10" key={row.studentId}>
                  <td className="px-4 py-3 font-bold">
                    {row.displayName || row.email || copy.common.learner}
                  </td>
                  <td className="px-4 py-3">{row.completedLessons}</td>
                  <td className="px-4 py-3">{row.xp}</td>
                  <td className="px-4 py-3">{row.level}</td>
                  <td className="px-4 py-3">{formatDate(row.lastVisit, language, copy.teacher.never)}</td>
                  <td className="px-4 py-3">{formatDate(row.joinedAt, language, copy.teacher.never)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
