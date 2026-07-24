import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { AssignMissionForm } from "@/components/teacher/assign-mission-form";
import { ClassroomControls } from "@/components/teacher/classroom-controls";
import { ClassroomReportTable } from "@/components/teacher/classroom-report-table";
import { CopyCodeButton } from "@/components/teacher/copy-code-button";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import { getCommonModules, getSpecialtyModules, getMissionsForModule } from "@/lib/curriculum/helpers";
import { getClassroomAssignments } from "@/lib/supabase/assignments";
import {
  getClassroomById,
  getClassroomReport,
  listTransferCandidates
} from "@/lib/supabase/classrooms";
import { summarizeClassroomReport } from "@/lib/classrooms/types";
import { getCurrentSession } from "@/lib/supabase/auth";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

function formatDue(value: string | null, language: string, fallback: string) {
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

export default async function TeacherClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;

  const classroom = await getClassroomById(id);
  if (!classroom) {
    notFound();
  }

  const session = await getCurrentSession();
  const canTransfer =
    Boolean(session.user) &&
    (session.isAdmin || session.user?.id === classroom.teacherId);

  const [report, assignments, curriculum, transferCandidates] = await Promise.all([
    getClassroomReport(id),
    getClassroomAssignments(id),
    getSchoolCurriculum(),
    canTransfer ? listTransferCandidates(classroom.teacherId) : Promise.resolve([])
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const summary = summarizeClassroomReport(report, today);

  const modules = [
    ...getCommonModules(curriculum, classroom.gradeLevel),
    ...(classroom.specialtyId
      ? getSpecialtyModules(curriculum, classroom.specialtyId, classroom.gradeLevel)
      : curriculum.specialties.flatMap((specialty) =>
          getSpecialtyModules(curriculum, specialty.id, classroom.gradeLevel)
        ))
  ];

  const assignedMissionIds = new Set(assignments.map((item) => item.missionId));
  const missionOptions = modules.flatMap((module) =>
    getMissionsForModule(curriculum, module.id)
      .filter((mission) => !assignedMissionIds.has(mission.id))
      .map((mission) => ({
        id: mission.id,
        label: localizeCurriculumText(mission.title, language),
        moduleTitle: localizeCurriculumText(module.title, language)
      }))
  );

  const statusLabel =
    classroom.status === "archived" ? copy.teacher.statusArchived : copy.teacher.statusActive;
  const joinStateLabel = classroom.joinCodeEnabled
    ? copy.teacher.joinCodeEnabled
    : copy.teacher.joinCodeDisabled;

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
            <p className="mt-2 text-sm text-ink/60">
              {copy.teacher.academicYearLabel}: {classroom.academicYear} · {copy.teacher.gradeLabel}:{" "}
              {classroom.gradeLevel} · {statusLabel} · {joinStateLabel}
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
        <ClassroomControls
          canTransfer={canTransfer}
          classroomId={classroom.id}
          joinCodeEnabled={classroom.joinCodeEnabled}
          language={language}
          status={classroom.status}
          transferCandidates={transferCandidates}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <AssignMissionForm classroomId={classroom.id} language={language} missions={missionOptions} />

        <section className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-soft">
          <h3 className="text-lg font-black">{copy.teacher.assignmentsTitle}</h3>
          {assignments.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">{copy.teacher.noAssignments}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {assignments.map((assignment) => (
                <li className="rounded-md border border-ink/10 px-4 py-3" key={assignment.id}>
                  <p className="font-bold">
                    {language === "bg"
                      ? assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
                      : assignment.missionTitle || assignment.missionId}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {copy.teacher.dueLabel}:{" "}
                    {formatDue(assignment.dueAt, language, copy.teacher.noDueDate)}
                  </p>
                  <Link
                    className="mt-2 inline-flex text-sm font-bold text-violet hover:underline"
                    href={`/teacher/classes/${classroom.id}/assignments/${assignment.id}`}
                  >
                    {copy.teacher.openAssignment}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6">
        <ClassroomReportTable language={language} rows={report} summary={summary} />
      </div>
    </div>
  );
}
