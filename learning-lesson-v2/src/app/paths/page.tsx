import { SchoolCurriculumExplorer } from "@/components/school-curriculum-explorer";
import { getSchoolCurriculum } from "@/lib/curriculum";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const [language, session, curriculum] = await Promise.all([
    getLanguage(),
    getCurrentSession(),
    getSchoolCurriculum()
  ]);
  const copy = t(language);

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <SchoolCurriculumExplorer
        curriculum={curriculum}
        isAuthenticated={Boolean(session.user)}
        language={language}
        pathsTitle={session.user ? copy.schoolCurriculum.pathsTitleStudent : copy.schoolCurriculum.pathsTitle}
      />
    </main>
  );
}
