import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { getPendingTeacherReviews } from "@/lib/supabase/assignments";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function TeacherReviewsPage() {
  const [language, pending] = await Promise.all([getLanguage(), getPendingTeacherReviews()]);
  const copy = t(language);

  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint">{copy.nav.roleTeacher}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.teacher.reviewsTitle}</h1>
        <p className="mt-2 text-base leading-7 text-ink/60">{copy.teacher.reviewsSubtitle}</p>
      </div>

      {pending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink/5">
            <ClipboardCheck className="size-6 text-ink/35" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink/55">{copy.teacher.reviewsEmpty}</p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {pending.map((item, index) => (
            <li className={index > 0 ? "border-t border-ink/8" : undefined} key={item.assignmentId}>
              <Link
                className="group flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-coral/[0.06]"
                href={`/teacher/classes/${item.classroomId}/assignments/${item.assignmentId}`}
              >
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">
                    <ClipboardCheck className="size-3.5" />
                    {item.classroomName}
                  </span>
                  <span className="mt-1 block font-display text-lg font-bold tracking-tight">
                    {language === "bg" ? item.missionTitleBg || item.missionTitle : item.missionTitle}
                  </span>
                  <span className="mt-1 inline-flex rounded-lg bg-coral/10 px-2.5 py-1 text-sm font-bold text-coral">
                    {item.pendingCount} {copy.teacher.reviewsPending}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-ink/65">
                  {copy.teacher.openAssignment}
                  <ArrowRight className="size-4 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/70" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
