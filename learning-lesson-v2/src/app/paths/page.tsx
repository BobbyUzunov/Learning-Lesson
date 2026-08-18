import Link from "next/link";
import { redirect } from "next/navigation";
import { SchoolCurriculumExplorer } from "@/components/school-curriculum-explorer";
import { SyllabusView } from "@/components/syllabus-view";
import { getCourseCatalog } from "@/lib/catalog";
import {
  getCurriculumMissionLabs,
  getSchoolCurriculum,
  resolveCurriculumMissionLabs,
  resolveMissionAssignmentState
} from "@/lib/curriculum";
import {
  buildCurriculumExplorerData,
  pickCurriculumExplorerCopy,
  type CurriculumExplorerMissionState
} from "@/lib/curriculum/explorer";
import { getCourseProjects } from "@/lib/projects/store";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";
import { getStudentClassrooms } from "@/lib/supabase/classrooms";

export const dynamic = "force-dynamic";

type PathsPageProps = {
  searchParams: Promise<{ tab?: string; guestLocked?: string; lessonLocked?: string }>;
};

export default async function PathsPage({ searchParams }: PathsPageProps) {
  const [language, session, curriculum, catalog, missionLabLinks, params, { projects }] = await Promise.all([
    getLanguage(),
    getCurrentSession(),
    getSchoolCurriculum(),
    getCourseCatalog(),
    getCurriculumMissionLabs(),
    searchParams,
    getCourseProjects()
  ]);
  const copy = t(language);
  if (!session.user) {
    redirect("/login");
  }
  const tab = params.tab === "labs" ? "labs" : "program";
  const [progressData, assignments, submissions, classrooms] = session.user
    ? await Promise.all([
        getCurrentUserProgress(),
        getMyAssignments(),
        getCurrentUserProjectSubmissions(),
        getStudentClassrooms()
      ])
    : [null, [], [], []];
  const completedLessonIds =
    progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id) ?? [];

  const missionStates: Record<string, CurriculumExplorerMissionState> = {};

  for (const mission of curriculum.missions) {
    const assignment = resolveMissionAssignmentState(assignments, mission.id);
    const labs = resolveCurriculumMissionLabs(missionLabLinks, catalog, mission.id, completedLessonIds);
    const firstLab = labs[0];

    if (!assignment && !firstLab) {
      continue;
    }

    missionStates[mission.id] = {
      assignmentId: assignment?.assignmentId ?? null,
      assignmentStatus: assignment?.status ?? null,
      lab: firstLab
        ? {
            courseTitle: localizeGameQuest(firstLab.course, language).title,
            completedCount: labs.filter((lab) => lab.completed).length,
            totalCount: labs.length,
            lessonIds: labs.map((lab) => lab.lessonId)
          }
        : null
    };
  }

  const explorerData = buildCurriculumExplorerData(curriculum, language, missionStates);
  const programHref = "/paths";
  const labsHref = "/paths?tab=labs";

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.learning}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {tab === "labs" ? copy.nav.learningLabs : copy.nav.learningProgram}
          </h1>
          <p className="mt-3 text-base leading-7 text-ink/60">
            {tab === "labs" ? copy.courses.subtitle : copy.schoolCurriculum.subtitle}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-ink/10 bg-white/70 p-1 text-sm font-bold">
          <Link
            aria-current={tab === "program" ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 transition ${
              tab === "program" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5 hover:text-ink"
            }`}
            href={programHref}
          >
            {copy.nav.learningProgram}
          </Link>
          <Link
            aria-current={tab === "labs" ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 transition ${
              tab === "labs" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5 hover:text-ink"
            }`}
            href={labsHref}
          >
            {copy.nav.learningLabs}
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {tab === "labs" ? (
          <SyllabusView
            catalog={catalog}
            completedLessonIds={session.user ? completedLessonIds : undefined}
            isAuthenticated={Boolean(session.user)}
            language={language}
            projects={projects}
            projectSubmissions={submissions}
            showGuestLockMessage={!session.user && Boolean(params.guestLocked)}
            showLessonLockMessage={Boolean(session.user && params.lessonLocked)}
          />
        ) : (
          <SchoolCurriculumExplorer
            copy={pickCurriculumExplorerCopy(copy.schoolCurriculum)}
            data={explorerData}
            isAuthenticated={Boolean(session.user)}
            lockedSpecialtyId={classrooms.find((classroom) => classroom.specialtyId)?.specialtyId ?? null}
          />
        )}
      </div>
    </main>
  );
}
