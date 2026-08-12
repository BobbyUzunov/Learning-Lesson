import Link from "next/link";
import { ArrowRight, ClipboardCheck, Inbox, Users } from "lucide-react";
import { getTeacherAssessments } from "@/lib/supabase/assessments";
import { getPendingTeacherReviews } from "@/lib/supabase/assignments";
import { getTeacherClassrooms } from "@/lib/supabase/classrooms";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherHomePage() {
  const language = await getLanguage();
  const copy = t(language);
  const [classrooms, assessments, pendingReviews] = await Promise.all([
    getTeacherClassrooms(),
    getTeacherAssessments(),
    getPendingTeacherReviews()
  ]);

  const activeClassrooms = classrooms.filter((classroom) => classroom.status === "active");
  const studentCount = classrooms.reduce((sum, classroom) => sum + (classroom.memberCount ?? 0), 0);
  const pendingCount = pendingReviews.reduce((sum, item) => sum + item.pendingCount, 0);
  const hasClassroom = classrooms.length > 0;
  const quickClasses = activeClassrooms.slice(0, 3);

  const primary =
    pendingCount > 0
      ? {
          href: "/teacher/reviews",
          label: copy.teacher.homePrimaryReviews.replace("{count}", String(pendingCount))
        }
      : hasClassroom
        ? {
            href: `/teacher/classes/${quickClasses[0]?.id ?? activeClassrooms[0]?.id ?? ""}`,
            label: copy.teacher.homePrimaryOpenClass
          }
        : {
            href: "/teacher/classes?create=1",
            label: copy.teacher.homePrimaryCreate
          };

  const actions = [
    {
      href: "/teacher/classes",
      title: copy.teacher.homeActionClasses,
      hint: copy.teacher.homeActionClassesHint,
      icon: Users,
      meta: hasClassroom ? String(activeClassrooms.length) : null
    },
    {
      href: "/teacher/reviews",
      title: copy.teacher.homeActionReviews,
      hint: copy.teacher.homeActionReviewsHint,
      icon: Inbox,
      meta: pendingCount > 0 ? String(pendingCount) : null,
      emphasize: pendingCount > 0
    },
    {
      href: "/teacher/assessments",
      title: copy.teacher.homeActionAssessments,
      hint: copy.teacher.homeActionAssessmentsHint,
      icon: ClipboardCheck,
      meta: assessments.length > 0 ? String(assessments.length) : null
    }
  ] as const;

  return (
    <div className="pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-ink text-paper">
        <span className="pointer-events-none absolute -left-16 -top-10 size-[18rem] rounded-full bg-mint/30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-16 -right-10 size-[20rem] rounded-full bg-coral/20 blur-3xl" />
        <span className="pointer-events-none absolute left-1/2 top-1/3 size-[14rem] -translate-x-1/2 rounded-full bg-violet/15 blur-3xl" />

        <div className="relative px-5 py-10 sm:px-8 sm:py-12">
          <div className="animate-home-rise max-w-2xl">
            <p className="inline-flex rounded-md border border-paper/15 bg-paper/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-mint">
              {copy.nav.roleTeacher}
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-tight">
              {copy.teacher.homeTitle}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-paper/60">{copy.teacher.homeSubtitleWork}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-paper/50">
              <span>
                <span className="font-bold text-paper">{activeClassrooms.length}</span> {copy.teacher.homeStatusClasses}
              </span>
              <span className="hidden text-paper/25 sm:inline">·</span>
              <span>
                <span className="font-bold text-paper">{studentCount}</span> {copy.teacher.homeStatusStudents}
              </span>
              <span className="hidden text-paper/25 sm:inline">·</span>
              <span>
                <span className="font-bold text-paper">{pendingCount}</span> {copy.teacher.homeStatusPending}
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

      {quickClasses.length > 0 ? (
        <section className="mt-8 animate-home-rise" style={{ animationDelay: "80ms" }}>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">{copy.teacher.homeYourClasses}</h2>
            <Link
              className="text-sm font-bold text-ink/50 underline-offset-4 transition hover:text-ink hover:underline"
              href="/teacher/classes"
            >
              {copy.teacher.homeAllClasses}
            </Link>
          </div>
          <ul className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/75 backdrop-blur-sm">
            {quickClasses.map((classroom, index) => (
              <li className={index > 0 ? "border-t border-ink/8" : undefined} key={classroom.id}>
                <Link
                  className="group flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-mint/[0.06]"
                  href={`/teacher/classes/${classroom.id}`}
                >
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-bold tracking-tight">{classroom.name}</span>
                    <span className="mt-1 block text-sm text-ink/50">
                      {classroom.memberCount ?? 0} {copy.teacher.studentsCount} · {copy.teacher.gradeLabel}{" "}
                      {classroom.gradeLevel}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-3">
                    <span className="rounded-lg bg-ink/[0.04] px-3 py-1.5 font-mono text-sm font-bold tracking-[0.2em] text-violet">
                      {classroom.joinCode}
                    </span>
                    <ArrowRight className="size-4 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-ink/70" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 animate-home-rise" style={{ animationDelay: "140ms" }}>
        <ul className="grid gap-3 sm:grid-cols-3">
          {actions.map((action) => (
            <li key={action.href}>
              <Link
                className={`focus-ring group flex h-full flex-col justify-between rounded-2xl border px-4 py-4 transition hover:-translate-y-0.5 ${
                  "emphasize" in action && action.emphasize
                    ? "border-coral/25 bg-coral/[0.07] hover:border-coral/40"
                    : "border-ink/10 bg-white/75 hover:border-ink/20 hover:bg-white"
                }`}
                href={action.href}
              >
                <span className="flex items-start justify-between gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${
                      "emphasize" in action && action.emphasize ? "bg-coral text-paper" : "bg-ink text-paper"
                    }`}
                  >
                    <action.icon className="size-4" />
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
    </div>
  );
}
