import { SchoolCurriculumExplorer } from "@/components/school-curriculum-explorer";
import { getCourseCatalog, getLessonFromCatalog } from "@/lib/catalog";
import { getSchoolCurriculum } from "@/lib/curriculum";
import type { MissionPrepInfo } from "@/lib/curriculum/mission-prep";
import { localizeLessonStructure } from "@/lib/lesson-structure";
import { localizeGameLesson, localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await getCurrentSession();
  const [catalog, curriculum] = await Promise.all([getCourseCatalog(), getSchoolCurriculum()]);

  const courseLabels = Object.fromEntries(
    catalog.courses.map((course) => [course.id, localizeGameQuest(course, language).title])
  );

  const prepByCourseId: Record<string, MissionPrepInfo> = {};
  for (const course of catalog.courses) {
    const lessonId = course.lessonIds[0];
    if (!lessonId) {
      continue;
    }
    const lesson = getLessonFromCatalog(catalog, lessonId);
    if (!lesson) {
      continue;
    }
    const localized = localizeGameLesson(lesson, language);
    const structure = localizeLessonStructure(localized, course, language);
    prepByCourseId[course.id] = {
      courseId: course.id,
      lessonId,
      minutes: structure.readingTimeMinutes,
      topic: structure.learningObjectives[0] ?? localized.title
    };
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <SchoolCurriculumExplorer
        courseLabels={courseLabels}
        curriculum={curriculum}
        isAuthenticated={Boolean(session.user)}
        language={language}
        pathsTitle={session.user ? copy.schoolCurriculum.pathsTitleStudent : copy.schoolCurriculum.pathsTitle}
        prepByCourseId={prepByCourseId}
      />
    </main>
  );
}
