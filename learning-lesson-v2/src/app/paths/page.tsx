import { SchoolCurriculumExplorer } from "@/components/school-curriculum-explorer";
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
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const [language, session, curriculum, catalog, missionLabLinks] = await Promise.all([
    getLanguage(),
    getCurrentSession(),
    getSchoolCurriculum(),
    getCourseCatalog(),
    getCurriculumMissionLabs()
  ]);
  const copy = t(language);
  const [progressData, assignments] = session.user
    ? await Promise.all([getCurrentUserProgress(), getMyAssignments()])
    : [null, []];
  const completedLessonIds = progressData?.progress
    .filter((item) => item.completed)
    .map((item) => item.lesson_id) ?? [];
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <SchoolCurriculumExplorer
        copy={pickCurriculumExplorerCopy(copy.schoolCurriculum)}
        data={explorerData}
        isAuthenticated={Boolean(session.user)}
        pathsTitle={session.user ? copy.schoolCurriculum.pathsTitleStudent : copy.schoolCurriculum.pathsTitle}
      />
    </main>
  );
}
