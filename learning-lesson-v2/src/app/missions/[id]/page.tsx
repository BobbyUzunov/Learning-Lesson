import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, Clock3, GraduationCap, Layers3, UsersRound } from "lucide-react";
import { MissionLabCard } from "@/components/curriculum/mission-lab-card";
import { getCourseCatalog } from "@/lib/catalog";
import { getQuestCertificates } from "@/lib/certificates";
import {
  getCurriculumMissionLabs,
  getSchoolCurriculum,
  localizeCurriculumText,
  resolveCurriculumMissionLabs,
  resolveMissionAssignmentState
} from "@/lib/curriculum";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";
import { toGameProgress } from "@/lib/game-progress";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCourseProjects } from "@/lib/projects/store";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, language, curriculum, session, catalog, missionLabLinks, { projects }] = await Promise.all([
    params,
    getLanguage(),
    getSchoolCurriculum(),
    getCurrentSession(),
    getCourseCatalog(),
    getCurriculumMissionLabs(),
    getCourseProjects()
  ]);
  const dictionary = t(language);
  const copy = dictionary.schoolCurriculum;
  const mission = curriculum.missions.find((entry) => entry.id === id);

  if (!mission) {
    notFound();
  }

  const curriculumModule = curriculum.modules.find((entry) => entry.id === mission.moduleId);
  if (!curriculumModule) {
    notFound();
  }

  const specialty = curriculumModule.specialtyId
    ? curriculum.specialties.find((entry) => entry.id === curriculumModule.specialtyId)
    : null;
  const style = curriculumAccentStyles[specialty?.accent ?? "ink"];
  const [progressData, assignments, submissions] = session.user
    ? await Promise.all([
        getCurrentUserProgress(),
        getMyAssignments(),
        getCurrentUserProjectSubmissions()
      ])
    : [null, [], []];
  const progress = progressData?.progress ?? [];
  const completedLessonIds = progress.filter((item) => item.completed).map((item) => item.lesson_id);
  const missionAssignment = resolveMissionAssignmentState(assignments, mission.id);
  const missionLabs = resolveCurriculumMissionLabs(missionLabLinks, catalog, mission.id, completedLessonIds);
  const certificates = getQuestCertificates(
    toGameProgress(progress),
    language,
    progress,
    submissions,
    catalog.courses,
    projects
  );
  const certificateByCourseId = new Map(certificates.map((certificate) => [certificate.questId, certificate]));
  const assignmentStatusLabel = missionAssignment
    ? missionAssignment.status === "approved"
      ? dictionary.classroom.statusApproved
      : missionAssignment.status === "submitted"
        ? dictionary.classroom.statusSubmitted
        : missionAssignment.status === "needs_changes"
          ? dictionary.classroom.statusNeedsChanges
          : missionAssignment.status === "draft"
            ? dictionary.classroom.statusDraft
            : dictionary.classroom.statusMissing
    : null;
  const steps = [
    { title: copy.planUnderstand, detail: copy.planUnderstandHint },
    { title: copy.planBuild, detail: copy.planBuildHint },
    { title: copy.planCheck, detail: copy.planCheckHint }
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink" href="/paths">
        <ArrowLeft className="size-4" />
        {copy.backToMissions}
      </Link>

      <section className={`relative mt-4 overflow-hidden rounded-3xl border bg-white p-5 shadow-soft sm:p-8 ${style.border}`}>
        <div aria-hidden="true" className={`absolute -right-16 -top-20 size-56 rounded-full blur-3xl ${style.glow}`} />
        <div className="relative">
          <p className={`text-xs font-black uppercase tracking-[0.16em] ${style.text}`}>{copy.missionBadge}</p>
          <p className="mt-3 text-sm font-bold text-ink/50">
            {specialty ? localizeCurriculumText(specialty.title, language) : copy.sharedModuleLabel}
            <span aria-hidden="true"> · </span>
            {localizeCurriculumText(curriculumModule.title, language)}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            {localizeCurriculumText(mission.title, language)}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink/70 sm:text-lg">
            {localizeCurriculumText(mission.brief, language)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm font-bold text-ink/70">
              <GraduationCap className={`size-5 ${style.text}`} />
              {copy.activeGrade}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm font-bold text-ink/70">
              <Clock3 className={`size-5 ${style.text}`} />
              {mission.estimatedMinutes} {copy.minutesShort}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm font-bold text-ink/70">
              <UsersRound className={`size-5 ${style.text}`} />
              {copy.noExperienceNeeded}
            </div>
          </div>

          <a
            className={`focus-ring mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition hover:-translate-y-0.5 ${style.button}`}
            href="#mission-plan"
          >
            {copy.startWithPlan}
            <ArrowDown className="size-5" />
          </a>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-ink p-5 text-paper sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-mint">{copy.deliverable}</p>
            <p className="mt-4 text-lg font-bold leading-8">
              {localizeCurriculumText(mission.deliverable, language)}
            </p>
            <p className="mt-4 text-sm leading-6 text-paper/60">{copy.keepResultHint}</p>
          </section>

          <section className="scroll-mt-24 rounded-3xl border border-ink/10 bg-white p-5 sm:p-7" id="mission-plan">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-ink/45">
              <Layers3 className="size-4" />
              {copy.missionPlan}
            </p>
            <ol className="mt-5 space-y-5">
              {steps.map((step, index) => (
                <li className="flex gap-4" key={step.title}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black ${style.icon}`}>
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-bold">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink/65">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {missionLabs.map((lab) => (
            <MissionLabCard
              certificate={certificateByCourseId.get(lab.course.id) ?? null}
              isAuthenticated={Boolean(session.user)}
              key={`${lab.missionId}-${lab.lessonId}`}
              lab={lab}
              language={language}
            />
          ))}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink/10 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">{copy.skills}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {mission.skills.map((skill) => (
                <li className={`rounded-full px-3 py-2 text-xs font-bold ${style.soft} ${style.text}`} key={skill.en}>
                  {localizeCurriculumText(skill, language)}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-white p-5">
            <h2 className="font-bold">{copy.classroomMissionTitle}</h2>
            {assignmentStatusLabel ? (
              <p
                className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                  missionAssignment?.verified ? "bg-mint/20 text-ink" : "bg-violet/10 text-violet"
                }`}
              >
                {assignmentStatusLabel}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {missionAssignment ? copy.assignmentStatusHint : copy.classroomMissionHint}
            </p>
            <Link
              className="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
              href={
                missionAssignment
                  ? `/assignments/${missionAssignment.assignmentId}`
                  : session.user
                    ? "/classes"
                    : `/login?redirect=${encodeURIComponent("/classes")}`
              }
            >
              {missionAssignment
                ? dictionary.classroom.openAssignment
                : session.user
                  ? copy.openMyClasses
                  : copy.signInForClasswork}
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
