import { SchoolCurriculumExplorer } from "@/components/school-curriculum-explorer";
import { SyllabusView } from "@/components/syllabus-view";
import { getCourseCatalog } from "@/lib/catalog";
import { getSchoolCurriculum } from "@/lib/curriculum";
import { getCourseProjects } from "@/lib/projects/store";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

type PathsPageProps = {
  searchParams: Promise<{ guestLocked?: string; lessonLocked?: string }>;
};

export default async function PathsPage({ searchParams }: PathsPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const params = await searchParams;
  const session = await getCurrentSession();
  const [catalog, curriculum, { projects }] = await Promise.all([
    getCourseCatalog(),
    getSchoolCurriculum(),
    getCourseProjects()
  ]);
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const submissions = session.user ? await getCurrentUserProjectSubmissions() : [];
  const completedLessonIds = progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <SchoolCurriculumExplorer
        courseLabels={Object.fromEntries(
          catalog.courses.map((course) => [course.id, localizeGameQuest(course, language).title])
        )}
        curriculum={curriculum}
        isAuthenticated={Boolean(session.user)}
        language={language}
      />
      <section className="mt-12 border-t border-ink/10 pt-8" id="practical-courses">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet">03 · {copy.paths.badge}</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">{copy.schoolCurriculum.availableCoursesTitle}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-ink/70">{copy.schoolCurriculum.availableCoursesSubtitle}</p>
      </section>
      <SyllabusView
        catalog={catalog}
        completedLessonIds={completedLessonIds}
        isAuthenticated={Boolean(session.user)}
        projects={projects}
        showGuestLockMessage={!session.user && Boolean(params.guestLocked)}
        showLessonLockMessage={Boolean(session.user && params.lessonLocked)}
        projectSubmissions={submissions}
        language={language}
      />
    </main>
  );
}
