import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCourseCatalog, getCatalogLessons, getGlobalNextLessonFromCourses } from "@/lib/catalog";
import { localizeGameLesson, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  await requireUser();
  const catalog = await getCourseCatalog();
  const [{ progress }, lessons, assignments] = await Promise.all([
    getCurrentUserProgress(),
    getCatalogLessons(),
    getMyAssignments()
  ]);

  const completedLessonIds = progress.filter((item) => item.completed).map((item) => item.lesson_id);
  const nextLessonId = getGlobalNextLessonFromCourses(catalog.courses, completedLessonIds);
  const nextLesson = nextLessonId ? lessons.find((lesson) => lesson.id === nextLessonId) : null;
  const localizedNext = nextLesson ? localizeGameLesson(nextLesson, language) : null;

  const activeAssignment =
    assignments.find((item) => item.submissionStatus === "needs_changes") ??
    assignments.find((item) => item.submissionStatus === "submitted") ??
    assignments.find((item) => item.submissionStatus !== "approved") ??
    null;

  const lastFeedback = assignments.find((item) => item.teacherNote)?.teacherNote ?? null;

  const primaryHref = activeAssignment
    ? `/assignments/${activeAssignment.id}`
    : localizedNext
      ? `/lesson/${localizedNext.id}`
      : "/paths";

  const primaryLabel = activeAssignment
    ? copy.dashboard.openAssignment
    : localizedNext
      ? copy.dashboard.continueHere
      : copy.dashboard.chooseMission;

  const missionTitle = activeAssignment
    ? language === "bg"
      ? activeAssignment.missionTitleBg || activeAssignment.missionTitle || activeAssignment.missionId
      : activeAssignment.missionTitle || activeAssignment.missionId
    : localizedNext?.title ?? copy.dashboard.noCurrentMission;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <p className="text-sm font-bold uppercase text-violet">{copy.nav.today}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.dashboard.continueHere}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{copy.dashboard.subtitle}</p>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">{copy.dashboard.currentMission}</p>
        <h2 className="mt-3 text-2xl font-bold">{missionTitle}</h2>

        {activeAssignment?.dueAt ? (
          <p className="mt-3 text-sm font-bold text-ink/60">
            {copy.dashboard.dueLabel}:{" "}
            {new Date(activeAssignment.dueAt).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        ) : null}

        {lastFeedback ? (
          <div className="mt-4 rounded-xl bg-coral/10 px-4 py-3">
            <p className="text-xs font-bold uppercase text-ink/50">{copy.dashboard.lastFeedback}</p>
            <p className="mt-2 text-sm leading-6 text-ink/80">{lastFeedback}</p>
          </div>
        ) : null}

        <Link
          className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-5 py-3 font-bold text-paper"
          href={primaryHref}
        >
          {primaryLabel}
          <ArrowRight className="size-5" />
        </Link>
      </section>

      <p className="mt-6 text-sm text-ink/55">
        <Link className="font-semibold text-violet underline-offset-4 hover:underline" href="/paths">
          {copy.dashboard.browseMissions}
        </Link>
        {" · "}
        <Link className="font-semibold text-violet underline-offset-4 hover:underline" href="/classes">
          {copy.nav.classes}
        </Link>
      </p>
    </main>
  );
}
