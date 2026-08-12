import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, ClipboardCheck, GraduationCap } from "lucide-react";
import { getCourseCatalog, getGlobalNextLessonFromCourses } from "@/lib/catalog";
import { localizeGameLesson, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getMyAssignments } from "@/lib/supabase/assignments";
import { getMyAssessments } from "@/lib/supabase/assessments";
import { isAssessmentExpired } from "@/lib/assessments/types";
import { getCurrentUserProgress } from "@/lib/supabase/progress";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await requireUser();

  if (session.isAdmin) {
    redirect("/admin");
  }
  if (session.isTeacher) {
    redirect("/teacher");
  }
  const [catalog, { progress }, assignments, assessments] = await Promise.all([
    getCourseCatalog(),
    getCurrentUserProgress(),
    getMyAssignments(),
    getMyAssessments()
  ]);
  const lessons = catalog.lessons;

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
  const activeAssessment =
    assessments.find((item) => !item.attempt && !isAssessmentExpired(item)) ?? null;

  const kind = activeAssessment ? "assessment" : activeAssignment ? "assignment" : localizedNext ? "lesson" : "browse";

  const primaryHref =
    kind === "assessment"
      ? `/assessments/${activeAssessment!.id}`
      : kind === "assignment"
        ? `/assignments/${activeAssignment!.id}`
        : kind === "lesson"
          ? `/lesson/${localizedNext!.id}`
          : "/paths";

  const primaryLabel =
    kind === "assessment"
      ? copy.assessment.openAssessment
      : kind === "assignment"
        ? copy.dashboard.openAssignment
        : kind === "lesson"
          ? copy.dashboard.continueHere
          : copy.dashboard.chooseMission;

  const missionTitle =
    kind === "assessment"
      ? activeAssessment!.title
      : kind === "assignment"
        ? language === "bg"
          ? activeAssignment!.missionTitleBg || activeAssignment!.missionTitle || activeAssignment!.missionId
          : activeAssignment!.missionTitle || activeAssignment!.missionId
        : kind === "lesson"
          ? localizedNext!.title
          : copy.dashboard.noCurrentMission;

  const whyLine =
    kind === "assessment"
      ? copy.dashboard.whyAssessment
      : kind === "assignment"
        ? copy.dashboard.whyAssignment
        : kind === "lesson"
          ? copy.dashboard.whyLesson
          : copy.dashboard.whyBrowse;

  const activeDueAt = activeAssessment?.dueAt ?? activeAssignment?.dueAt;
  const StepIcon = kind === "assessment" ? ClipboardCheck : kind === "assignment" ? GraduationCap : BookOpen;
  const displayName = session.profile?.display_name?.trim() || null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="pb-2">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-paper">
        <span className="pointer-events-none absolute -left-16 -top-10 size-[18rem] rounded-full bg-mint/30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -right-12 size-[22rem] rounded-full bg-coral/25 blur-3xl" />
        <span className="pointer-events-none absolute left-[40%] top-1/2 size-[12rem] -translate-y-1/2 rounded-full bg-violet/10 blur-3xl" />

        <div className="relative px-5 py-10 sm:px-8 sm:py-12">
          <div className="animate-home-rise max-w-2xl">
            <p className="inline-flex rounded-md border border-paper/15 bg-paper/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-mint">
              {copy.nav.today}
              {displayName ? ` · ${displayName}` : ""}
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-tight">
              {copy.dashboard.continueHere}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-paper/60">{copy.dashboard.subtitle}</p>

            <div className="mt-8 border-t border-paper/10 pt-6">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-paper/45">
                <StepIcon aria-hidden className="size-3.5 text-mint" />
                {copy.dashboard.nextStep}
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper sm:text-[1.75rem]">
                {missionTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-paper/55">{whyLine}</p>

              {activeDueAt ? (
                <p className="mt-3 text-sm font-bold text-mint/90">
                  {copy.dashboard.dueLabel}:{" "}
                  {new Date(activeDueAt).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              ) : null}
            </div>

            <Link
              className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/90"
              href={primaryHref}
            >
              {primaryLabel}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {lastFeedback ? (
        <section
          className="mt-6 animate-home-rise rounded-2xl border border-coral/20 bg-coral/[0.08] px-5 py-4 sm:px-6"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.dashboard.lastFeedback}</p>
          <p className="mt-2 text-sm leading-6 text-ink/80">{lastFeedback}</p>
        </section>
      ) : null}

      <nav
        className="mt-6 flex animate-home-rise flex-wrap gap-3"
        style={{ animationDelay: lastFeedback ? "140ms" : "80ms" }}
      >
        <Link
          className="group inline-flex min-h-11 flex-1 items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm font-bold text-ink/75 transition hover:border-ink/20 hover:bg-white sm:flex-none"
          href="/classes"
        >
          {copy.dashboard.viewClassWork}
          <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/55" />
        </Link>
        <Link
          className="group inline-flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-bold text-ink/45 transition hover:border-ink/15 hover:text-ink/70"
          href="/profile"
        >
          {copy.nav.profile}
          <ArrowRight className="size-4 text-ink/20 transition group-hover:translate-x-0.5" />
        </Link>
      </nav>
      </div>
    </main>
  );
}
