import Link from "next/link";
import { QuestSelection } from "@/components/quest-selection";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type PathsPageProps = {
  searchParams: Promise<{ guestLocked?: string; lessonLocked?: string }>;
};

export default async function PathsPage({ searchParams }: PathsPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const params = await searchParams;
  const session = await getCurrentSession();
  const progressData = session.user ? await getCurrentUserProgress() : null;
  const completedLessonIds = progressData?.progress.filter((item) => item.completed).map((item) => item.lesson_id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-mint">{copy.paths.badge}</p>
          <h1 className="mt-2 text-4xl font-black">{copy.paths.title}</h1>
          <p className="mt-3 max-w-2xl text-ink/70">{copy.paths.subtitle}</p>
          {!session.user ? (
            <p className="mt-3 rounded-md bg-mint/15 px-3 py-2 text-sm font-semibold text-ink">{copy.paths.guestBanner}</p>
          ) : null}
        </div>
        {!session.user ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link className="rounded-md bg-ink px-4 py-3 text-center font-bold text-paper" href="/register">
              {copy.nav.register}
            </Link>
            <Link className="rounded-md border border-ink/15 px-4 py-3 text-center font-bold" href="/login">
              {copy.nav.login}
            </Link>
          </div>
        ) : null}
      </div>
      <QuestSelection
        completedLessonIds={completedLessonIds}
        isAuthenticated={Boolean(session.user)}
        showGuestLockMessage={!session.user && Boolean(params.guestLocked)}
        showLessonLockMessage={Boolean(session.user && params.lessonLocked)}
        language={language}
      />
    </main>
  );
}
