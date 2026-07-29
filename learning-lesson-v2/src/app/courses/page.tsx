import { SyllabusView } from "@/components/syllabus-view";
import { getCourseCatalog } from "@/lib/catalog";
import { getCourseProjects } from "@/lib/projects/store";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

type CoursesPageProps = {
  searchParams: Promise<{ guestLocked?: string; lessonLocked?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const [language, params, session, catalog, { projects }] = await Promise.all([
    getLanguage(),
    searchParams,
    getCurrentSession(),
    getCourseCatalog(),
    getCourseProjects()
  ]);
  const copy = t(language);
  const [progressData, submissions] = session.user
    ? await Promise.all([getCurrentUserProgress(), getCurrentUserProjectSubmissions()])
    : [null, []];
  const completedLessonIds = progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.courses.title}</h1>
        <p className="mt-3 text-base leading-7 text-ink/60">{copy.courses.subtitle}</p>
      </div>

      <div className="mt-8">
        <SyllabusView
          catalog={catalog}
          completedLessonIds={completedLessonIds}
          isAuthenticated={Boolean(session.user)}
          language={language}
          projects={projects}
          projectSubmissions={submissions}
          showGuestLockMessage={!session.user && Boolean(params.guestLocked)}
          showLessonLockMessage={Boolean(session.user && params.lessonLocked)}
        />
      </div>
    </main>
  );
}
