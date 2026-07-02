import Link from "next/link";
import { DashboardGameSummary } from "@/components/dashboard-game-summary";
import { getCourseCatalog, getCatalogLessons } from "@/lib/catalog";
import { getCourseProjects } from "@/lib/projects/store";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentUserProjectSubmissions, toSubmittedProjectIds } from "@/lib/supabase/project-submissions";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  await requireUser();
  const catalog = await getCourseCatalog();
  const { projects } = await getCourseProjects();
  const [{ progress, streakCount }, lessons, submissions] = await Promise.all([
    getCurrentUserProgress(),
    getCatalogLessons(),
    getCurrentUserProjectSubmissions()
  ]);
  const submittedProjectIds = toSubmittedProjectIds(submissions);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-violet">{copy.dashboard.continueLearning}</p>
          <h1 className="mt-2 text-4xl font-black">{copy.dashboard.title}</h1>
          <p className="mt-3 max-w-2xl text-ink/70">{copy.dashboard.subtitle}</p>
        </div>
        <Link className="rounded-md border border-ink/15 px-4 py-3 text-center font-bold" href="/paths">
          {copy.dashboard.browseCourses}
        </Link>
      </div>

      <DashboardGameSummary
        courses={catalog.courses}
        initialLessons={lessons}
        initialProgress={progress}
        initialStreak={streakCount}
        projects={projects}
        submittedProjectIds={submittedProjectIds}
        language={language}
      />
    </main>
  );
}
