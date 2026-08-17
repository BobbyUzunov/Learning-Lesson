import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DownloadCsvButton } from "@/components/teacher/download-csv-button";
import { classroomGradebookToCsv, gradebookCsvFilename } from "@/lib/gradebook/csv";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getClassroomById } from "@/lib/supabase/classrooms";
import { getClassroomGradebook } from "@/lib/supabase/gradebook";

export const dynamic = "force-dynamic";

const toneClass = {
  ok: "text-mint",
  warn: "text-coral",
  missing: "text-ink/40",
  neutral: "text-ink/70"
} as const;

export default async function TeacherGradebookPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).teacher;
  const { id } = await params;

  const classroom = await getClassroomById(id);
  if (!classroom) {
    notFound();
  }

  const gradebook = await getClassroomGradebook(id, language);
  const csv = classroomGradebookToCsv({
    gradebook,
    studentHeader: copy.colStudent,
    xpHeader: copy.colXp,
    lessonsHeader: copy.colCompleted
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
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.gradebookTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">{copy.gradebookSubtitle}</p>
        </div>
        {gradebook.rows.length > 0 ? (
          <DownloadCsvButton csv={csv} filename={gradebookCsvFilename(classroom.name)} label={copy.gradebookExport} />
        ) : null}
      </header>

      {gradebook.rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-5 text-sm text-ink/55">
          {copy.gradebookEmpty}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white/75">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-4 py-3">{copy.colStudent}</th>
                {gradebook.columns.map((column) => (
                  <th className="px-4 py-3 font-semibold" key={column.id}>
                    <Link className="underline-offset-2 hover:underline" href={column.href}>
                      {column.label}
                    </Link>
                  </th>
                ))}
                <th className="px-4 py-3">{copy.colXp}</th>
                <th className="px-4 py-3">{copy.colCompleted}</th>
              </tr>
            </thead>
            <tbody>
              {gradebook.rows.map((row) => (
                <tr className="border-t border-ink/10" key={row.studentId}>
                  <td className="px-4 py-3 font-bold">{row.name}</td>
                  {gradebook.columns.map((column) => {
                    const cell = row.cells[column.id];
                    return (
                      <td className={`px-4 py-3 ${toneClass[cell?.tone ?? "neutral"]}`} key={column.id}>
                        {cell?.label ?? copy.statusMissing}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">{row.xp}</td>
                  <td className="px-4 py-3">{row.completedLessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {gradebook.rows.length > 0 && gradebook.columns.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">{copy.gradebookNoWork}</p>
      ) : null}
    </div>
  );
}
