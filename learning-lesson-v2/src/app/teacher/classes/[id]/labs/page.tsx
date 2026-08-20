import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DownloadCsvButton } from "@/components/teacher/download-csv-button";
import { getCourseCatalog } from "@/lib/catalog";
import {
  buildClassroomLabProgress,
  classroomLabProgressToCsv,
  labProgressCsvFilename
} from "@/lib/classrooms/lab-progress";
import { formatMessage, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getClassroomById, getClassroomLabProgress, getClassroomReport } from "@/lib/supabase/classrooms";

export const dynamic = "force-dynamic";

const toneClass = {
  complete: "text-mint",
  started: "text-ink/80",
  not_started: "text-ink/35"
} as const;

function formatLabDate(value: string | null, language: string, fallback: string) {
  if (!value) {
    return fallback;
  }
  return new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function TeacherClassroomLabsPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).teacher;
  const { id } = await params;

  const classroom = await getClassroomById(id);
  if (!classroom) {
    notFound();
  }

  const [catalog, students, completions] = await Promise.all([
    getCourseCatalog(),
    getClassroomReport(id),
    getClassroomLabProgress(id)
  ]);

  const progress = buildClassroomLabProgress({
    students,
    courses: catalog.courses,
    completions,
    language
  });
  const csv = classroomLabProgressToCsv({
    progress,
    studentHeader: copy.colStudent,
    strongestHeader: copy.labsStrongest,
    lastActivityHeader: copy.labsLastActivity,
    completeLabel: copy.labsComplete,
    notStartedLabel: copy.labsNotStarted
  });

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/50 transition hover:text-ink"
        href={`/teacher/classes/${id}`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToClass}
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{classroom.name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.labsTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">{copy.labsSubtitle}</p>
        </div>
        {progress.rows.length > 0 ? (
          <DownloadCsvButton csv={csv} filename={labProgressCsvFilename(classroom.name)} label={copy.labsExport} />
        ) : null}
      </header>

      {progress.rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-5 text-sm text-ink/55">
          {copy.labsEmpty}
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-white/75 px-4 py-4">
              <p className="text-sm text-ink/55">{copy.labsStartedCount}</p>
              <p className="mt-1 text-2xl font-black">
                {progress.summary.startedCount}/{progress.summary.studentCount}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/75 px-4 py-4">
              <p className="text-sm text-ink/55">{copy.labsCoursesDone}</p>
              <p className="mt-1 text-2xl font-black">{progress.summary.completedCourseCount}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/75 px-4 py-4">
              <p className="text-sm text-ink/55">{copy.labsAvgProgress}</p>
              <p className="mt-1 text-2xl font-black">
                {formatMessage(copy.labsPercent, { percent: progress.summary.averageStrongestPercent })}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white/75">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-ink text-paper">
                <tr>
                  <th className="px-4 py-3">{copy.colStudent}</th>
                  <th className="px-4 py-3">{copy.labsStrongest}</th>
                  {progress.courses.map((course) => (
                    <th className="px-4 py-3 font-semibold" key={course.id}>
                      {course.title}
                    </th>
                  ))}
                  <th className="px-4 py-3">{copy.labsLastActivity}</th>
                </tr>
              </thead>
              <tbody>
                {progress.rows.map((row) => (
                  <tr className="border-t border-ink/10" key={row.studentId}>
                    <td className="px-4 py-3 font-bold">{row.name}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {row.strongest
                        ? `${row.strongest.title} · ${formatMessage(copy.labsPercent, { percent: row.strongest.percent })}`
                        : copy.labsNotStarted}
                    </td>
                    {progress.courses.map((course) => {
                      const cell = row.cells[course.id];
                      const status = cell?.status ?? "not_started";
                      return (
                        <td className={`px-4 py-3 font-semibold ${toneClass[status]}`} key={course.id}>
                          {!cell || status === "not_started"
                            ? copy.labsNotStarted
                            : status === "complete"
                              ? `${copy.labsComplete} ${cell.completed}/${cell.total}`
                              : `${cell.completed}/${cell.total}`}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-ink/60">
                      {formatLabDate(row.lastLabAt, language, copy.never)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {progress.summary.startedCount === 0 ? (
            <p className="mt-4 text-sm text-ink/50">{copy.labsNoProgress}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
