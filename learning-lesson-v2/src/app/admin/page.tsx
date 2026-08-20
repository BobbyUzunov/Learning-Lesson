import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Sparkles,
  UserCog,
  Users
} from "lucide-react";
import { AdminSeedButton } from "@/components/admin-seed-button";
import { getCourseCatalog } from "@/lib/catalog";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getAdminKnowledgeCheckContent } from "@/lib/knowledge-check";
import { hasOpenAIEnv } from "@/lib/mentor/env";
import { getCourseProjects } from "@/lib/projects/store";
import { getPendingReviewSubmissions } from "@/lib/supabase/project-submissions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [language, catalog, { projects }, knowledgeChecks, pendingReviews] = await Promise.all([
    getLanguage(),
    getCourseCatalog(),
    getCourseProjects(),
    getAdminKnowledgeCheckContent(),
    getPendingReviewSubmissions()
  ]);
  const copy = t(language);
  const contentSeedEnabled = process.env.ENABLE_ADMIN_CONTENT_SEED === "1";
  const mentorConfigured = hasOpenAIEnv();
  const quests = catalog.courses.map((quest) => localizeGameQuest(quest, language));
  const pendingCount = pendingReviews.length;

  const primary =
    pendingCount > 0
      ? {
          href: "/admin/reviews",
          label: copy.admin.homePrimaryReviews.replace("{count}", String(pendingCount))
        }
      : {
          href: "/admin/projects",
          label: copy.admin.homePrimaryContent
        };

  const manageActions = [
    {
      href: "/admin/reviews",
      title: copy.admin.homeActionReviews,
      hint: copy.admin.homeActionReviewsHint,
      icon: Inbox,
      meta: pendingCount > 0 ? String(pendingCount) : null,
      emphasize: pendingCount > 0
    },
    {
      href: "/admin/projects",
      title: copy.admin.homeActionProjects,
      hint: copy.admin.homeActionProjectsHint,
      icon: FolderKanban,
      meta: projects.length > 0 ? String(projects.length) : null,
      emphasize: false
    },
    {
      href: "/admin/knowledge-checks",
      title: copy.admin.homeActionChecks,
      hint: copy.admin.homeActionChecksHint,
      icon: ClipboardCheck,
      meta: knowledgeChecks.questions.length > 0 ? String(knowledgeChecks.questions.length) : null,
      emphasize: false
    },
    {
      href: "/admin/teachers",
      title: copy.admin.homeActionRoles,
      hint: copy.admin.homeActionRolesHint,
      icon: UserCog,
      meta: null,
      emphasize: false
    }
  ] as const;

  const accessActions = [
    {
      href: "/teacher",
      title: copy.admin.homeAccessTeacher,
      hint: copy.admin.homeAccessTeacherHint,
      icon: Users
    },
    {
      href: "/paths",
      title: copy.admin.homeAccessLearning,
      hint: copy.admin.homeAccessLearningHint,
      icon: BookOpen
    },
    {
      href: "/dashboard",
      title: copy.admin.homeAccessStudent,
      hint: copy.admin.homeAccessStudentHint,
      icon: LayoutDashboard
    },
    {
      href: "/classes",
      title: copy.admin.homeAccessClassHub,
      hint: copy.admin.homeAccessClassHubHint,
      icon: GraduationCap
    },
    {
      href: "/classes",
      title: copy.admin.homeActionMentor,
      hint: mentorConfigured
        ? copy.admin.homeActionMentorHint
        : copy.admin.homeActionMentorHintOffline,
      icon: Sparkles,
      meta: mentorConfigured ? copy.admin.homeMentorOn : copy.admin.homeMentorOff
    }
  ] as const;

  return (
    <div className="pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-paper">
        <span className="pointer-events-none absolute -left-16 -top-10 size-[18rem] rounded-full bg-violet/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-16 -right-10 size-[20rem] rounded-full bg-mint/20 blur-3xl" />

        <div className="relative px-5 py-10 sm:px-8 sm:py-12">
          <div className="animate-home-rise max-w-2xl">
            <p className="inline-flex rounded-md border border-paper/15 bg-paper/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-mint">
              {copy.nav.roleAdmin}
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-tight">
              {copy.admin.homeTitle}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-paper/60">{copy.admin.homeSubtitle}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-paper/50">
              <span>
                <span className="font-bold text-paper">{pendingCount}</span> {copy.admin.homeStatusPending}
              </span>
              <span className="hidden text-paper/25 sm:inline">·</span>
              <span>
                <span className="font-bold text-paper">{quests.length}</span> {copy.admin.homeStatusCourses}
              </span>
              <span className="hidden text-paper/25 sm:inline">·</span>
              <span>
                <span className="font-bold text-paper">{projects.length}</span> {copy.admin.homeStatusProjects}
              </span>
            </div>

            <Link
              className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/90"
              href={primary.href}
            >
              {primary.label}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 animate-home-rise" style={{ animationDelay: "80ms" }}>
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.admin.homeQuickTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {manageActions.map((action) => (
            <li key={action.href}>
              <Link
                className={`group flex h-full flex-col rounded-2xl border px-5 py-4 transition hover:-translate-y-0.5 ${
                  action.emphasize
                    ? "border-coral/25 bg-coral/[0.08] hover:border-coral/40"
                    : "border-ink/10 bg-white/75 hover:border-ink/20 hover:bg-white"
                }`}
                href={action.href}
              >
                <span className="flex items-center justify-between gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${
                      action.emphasize ? "bg-coral text-paper" : "bg-ink/5 text-ink"
                    }`}
                  >
                    <action.icon className="size-5" />
                  </span>
                  {action.meta ? (
                    <span className="rounded-md bg-ink/5 px-2 py-0.5 text-xs font-bold text-ink/65">{action.meta}</span>
                  ) : (
                    <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/55" />
                  )}
                </span>
                <span className="mt-4">
                  <span className="block font-display text-lg font-bold tracking-tight">{action.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink/50">{action.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 animate-home-rise" style={{ animationDelay: "110ms" }}>
        <h2 className="font-display text-xl font-bold tracking-tight">{copy.admin.homeAccessTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{copy.admin.homeAccessSubtitle}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accessActions.map((action) => (
            <li key={action.title}>
              <Link
                className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-white/75 px-5 py-4 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white"
                href={action.href}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-violet/10 text-violet">
                    <action.icon className="size-5" />
                  </span>
                  {"meta" in action && action.meta ? (
                    <span className="rounded-md bg-ink/5 px-2 py-0.5 text-xs font-bold text-ink/65">{action.meta}</span>
                  ) : (
                    <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/55" />
                  )}
                </span>
                <span className="mt-4">
                  <span className="block font-display text-lg font-bold tracking-tight">{action.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink/50">{action.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 animate-home-rise" style={{ animationDelay: "140ms" }}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">{copy.admin.homeCoursesTitle}</h2>
          <p className="text-xs font-bold text-ink/40">
            {copy.admin.catalogSource}: {catalog.source === "db" ? copy.admin.catalogDb : copy.admin.catalogFallback}
          </p>
        </div>
        <ul className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {quests.map((quest, index) => (
            <li
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-ink/8" : ""
              }`}
              key={quest.id}
            >
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 font-semibold text-ink/85">
                  <BookOpen className="size-4 shrink-0 text-ink/30" />
                  {quest.title}
                </p>
                <p className="mt-0.5 text-xs text-ink/40">{quest.estimatedTime}</p>
              </div>
              <Link
                className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                href={`/admin/courses/${quest.id}`}
              >
                {copy.admin.editCourse}
                <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <details className="mt-8 rounded-2xl border border-ink/10 bg-white/60 open:bg-white/80">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-ink/55 [&::-webkit-details-marker]:hidden">
          {copy.admin.homeSettings}
        </summary>
        <div className="border-t border-ink/8 px-5 py-4">
          <p className="text-sm text-ink/50">{copy.admin.homeSettingsHint}</p>
          <p className="mt-3 text-sm text-ink/65">
            {copy.admin.homeMentorStatus}:{" "}
            <span className="font-bold text-ink">
              {mentorConfigured ? copy.admin.homeMentorOn : copy.admin.homeMentorOff}
            </span>
          </p>
          {!mentorConfigured ? (
            <p className="mt-1 text-xs text-ink/45">{copy.admin.homeMentorStatusHint}</p>
          ) : null}
          {contentSeedEnabled ? (
            <div className="mt-4">
              <AdminSeedButton language={language} />
            </div>
          ) : (
            <p className="mt-3 text-xs font-bold text-ink/35">{copy.admin.homeSeedDisabled}</p>
          )}
        </div>
      </details>
    </div>
  );
}
