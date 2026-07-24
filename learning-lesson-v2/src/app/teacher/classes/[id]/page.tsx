import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ClassroomReportTable } from "@/components/teacher/classroom-report-table";
import { CopyCodeButton } from "@/components/teacher/copy-code-button";
import { getClassroomById, getClassroomReport } from "@/lib/supabase/classrooms";
import { summarizeClassroomReport } from "@/lib/classrooms/types";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;

  const classroom = await getClassroomById(id);
  if (!classroom) {
    notFound();
  }

  const report = await getClassroomReport(id);
  const today = new Date().toISOString().slice(0, 10);
  const summary = summarizeClassroomReport(report, today);

  return (
    <div>
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink" href="/teacher">
        <ArrowLeft className="size-4" />
        {copy.teacher.backToClasses}
      </Link>

      <div className="mt-4 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="break-words text-2xl font-black sm:text-3xl">{classroom.name}</h1>
            {classroom.description ? <p className="mt-2 text-sm text-ink/60">{classroom.description}</p> : null}
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink/70">
              <Users className="size-4" />
              {classroom.memberCount ?? 0} {copy.teacher.studentsCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-ink/50">{copy.teacher.joinCodeLabel}</p>
            <p className="font-mono text-3xl font-black tracking-[0.2em] text-violet">{classroom.joinCode}</p>
            <div className="mt-3 flex justify-end">
              <CopyCodeButton code={classroom.joinCode} language={language} />
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-md bg-ink/5 px-4 py-3 text-sm text-ink/70">{copy.teacher.shareHint}</p>
      </div>

      <div className="mt-6">
        <ClassroomReportTable language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
