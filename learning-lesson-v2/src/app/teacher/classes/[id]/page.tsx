import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck, Plus, Users } from "lucide-react";
import { AssignMissionForm } from "@/components/teacher/assign-mission-form";
import { ClassroomControls } from "@/components/teacher/classroom-controls";
import { ClassroomStudentsList } from "@/components/teacher/classroom-students-list";
import { CopyCodeButton } from "@/components/teacher/copy-code-button";
import { getSchoolCurriculum, localizeCurriculumText } from "@/lib/curriculum";
import { getCommonModules, getSpecialtyModules, getMissionsForModule } from "@/lib/curriculum/helpers";
import { getClassroomAssignments } from "@/lib/supabase/assignments";
import { getClassroomAssessments } from "@/lib/supabase/assessments";
import {
  getClassroomById,
  getClassroomReport,
  listClassroomTeachers,
  listCoTeacherCandidates,
  listTransferCandidates
} from "@/lib/supabase/classrooms";
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
    Boolean(session.user) && (session.isAdmin || session.user?.id === classroom.teacherId);

  const [report, assignments, assessments, curriculum, transferCandidates, classroomTeachers, coTeacherCandidates] =
    await Promise.all([
      getClassroomReport(id),
      getClassroomAssignments(id),
      getClassroomAssessments(id),
      getSchoolCurriculum(),
      canTransfer ? listTransferCandidates(classroom.id) : Promise.resolve([]),
      canTransfer ? listClassroomTeachers(classroom.id) : Promise.resolve([]),
      canTransfer ? listCoTeacherCandidates(classroom.id) : Promise.resolve([])
    ]);

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

  return (
    <div>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/50 transition hover:text-ink"
        href="/teacher/classes"
      >
        <ArrowLeft className="size-4" />
        {copy.teacher.backToClasses}
      </Link>

      <header className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{copy.nav.roleTeacher}</p>
        <h1 className="mt-2 break-words font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {classroom.name}
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink/60">
          <Users className="size-4 text-ink/35" />
          {classroom.memberCount ?? report.length} {copy.teacher.studentsCount}
          <span className="text-ink/25">·</span>
          {copy.teacher.gradeLabel} {classroom.gradeLevel}
        </p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl bg-ink text-paper">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <span className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-mint/25 blur-3xl" />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-paper/45">
            {copy.teacher.joinCodeLabel}
          </p>
          <div className="relative mt-3 flex flex-wrap items-end justify-between gap-4">
            <p className="font-mono text-[clamp(2rem,6vw,3rem)] font-black tracking-[0.22em] text-mint">
              {classroom.joinCode}
            </p>
            <CopyCodeButton code={classroom.joinCode} language={language} tone="dark" />
          </div>
          <p className="relative mt-3 max-w-xl text-sm text-paper/50">{copy.teacher.shareHint}</p>
          {!classroom.joinCodeEnabled ? (
            <p className="relative mt-3 text-sm font-bold text-coral">{copy.teacher.joinCodeDisabled}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          className="focus-ring group flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 transition hover:-translate-y-0.5 hover:border-ink/20"
          href={`/teacher/classes/${classroom.id}/assessments/new`}
        >
          <span className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-paper">
              <Plus className="size-4" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold tracking-tight">
                {copy.assessment.createAssessment}
              </span>
              <span className="mt-0.5 block text-sm text-ink/50">
                {assessments.length} {copy.assessment.teacherTitle.toLowerCase()}
              </span>
            </span>
          </span>
          <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/60" />
        </Link>

        <Link
          className="focus-ring group flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 transition hover:-translate-y-0.5 hover:border-ink/20"
          href={`/teacher/classes/${classroom.id}/assessments`}
        >
          <span className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-paper">
              <ClipboardCheck className="size-4" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold tracking-tight">
                {copy.assessment.teacherTitle}
              </span>
              <span className="mt-0.5 block text-sm text-ink/50">{copy.teacher.classOpenChecks}</span>
            </span>
          </span>
          <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/60" />
        </Link>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">{copy.teacher.assignmentsTitle}</h2>
        </div>

        {assignments.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">{copy.teacher.noAssignments}</p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
            {assignments.map((assignment, index) => (
              <li className={index > 0 ? "border-t border-ink/8" : undefined} key={assignment.id}>
                <Link
                  className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-mint/[0.06]"
                  href={`/teacher/classes/${classroom.id}/assignments/${assignment.id}`}
                >
                  <span className="min-w-0">
                    <span className="block font-bold">
                      {language === "bg"
                        ? assignment.missionTitleBg || assignment.missionTitle || assignment.missionId
                        : assignment.missionTitle || assignment.missionId}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink/50">
                      {copy.teacher.dueLabel}: {formatDue(assignment.dueAt, language, copy.teacher.noDueDate)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink/60">
                    {copy.teacher.openAssignment}
                    <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <AssignMissionForm classroomId={classroom.id} language={language} missions={missionOptions} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.teacher.classStudentsTitle}</h2>
        <p className="mt-1 text-sm text-ink/50">{copy.teacher.classStudentsHint}</p>
        <ClassroomStudentsList classroomId={classroom.id} language={language} rows={report} />
      </section>

      <details className="mt-8 rounded-2xl border border-ink/10 bg-white/60 open:bg-white/80">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-ink/60 [&::-webkit-details-marker]:hidden">
          {copy.teacher.classSettings}
        </summary>
        <div className="border-t border-ink/8 px-2 pb-2 pt-1 sm:px-3 sm:pb-3">
          <ClassroomControls
            canTransfer={canTransfer}
            classroomId={classroom.id}
            classroomTeachers={classroomTeachers}
            coTeacherCandidates={coTeacherCandidates}
            joinCodeEnabled={classroom.joinCodeEnabled}
            language={language}
            status={classroom.status}
            transferCandidates={transferCandidates}
          />
        </div>
      </details>
    </div>
  );
}
