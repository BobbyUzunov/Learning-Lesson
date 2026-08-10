import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, FlaskConical } from "lucide-react";
import type {
  CurriculumExplorerCopy,
  CurriculumExplorerMission,
  CurriculumExplorerSpecialty
} from "@/lib/curriculum/explorer";
import { curriculumAccentStyles } from "@/lib/curriculum/ui";

type StudentMissionCardProps = {
  copy: CurriculumExplorerCopy;
  mission: CurriculumExplorerMission;
  specialty: CurriculumExplorerSpecialty;
  onBrowseAll: () => void;
};

export function StudentMissionCard({
  copy,
  mission,
  specialty,
  onBrowseAll
}: StudentMissionCardProps) {
  const style = curriculumAccentStyles[specialty.accent];
  const assignmentLabel =
    mission.assignmentStatus === "approved"
      ? copy.assignmentApproved
      : mission.assignmentStatus === "submitted"
        ? copy.assignmentSubmitted
        : mission.assignmentStatus === "needs_changes"
          ? copy.assignmentNeedsChanges
          : mission.assignmentStatus
            ? copy.assignmentAssigned
            : null;

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl border bg-white p-5 shadow-soft sm:p-6 ${style.border}`}
      id="recommended-mission"
    >
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${style.text}`}>{copy.recommendedMission}</p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
        {mission.title}
      </h2>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{copy.whatYouWillDo}</p>
          <p className="mt-2 text-base leading-7 text-ink/70">{mission.brief}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{copy.whatYouWillSubmit}</p>
          <p className="mt-2 text-base leading-7 text-ink/70">{mission.deliverable}</p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-bold text-ink/60">
          <Clock3 className="size-4" />
          {mission.estimatedMinutes} {copy.minutes}
        </p>
        {assignmentLabel || mission.lab ? (
          <div className="flex flex-wrap gap-2">
            {assignmentLabel ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  mission.assignmentStatus === "approved" ? "bg-mint/20 text-ink" : "bg-violet/10 text-violet"
                }`}
              >
                <BadgeCheck className="size-3.5" />
                {assignmentLabel}
              </span>
            ) : null}
            {mission.lab ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-bold text-ink/75">
                <FlaskConical className="size-3.5 text-coral" />
                {mission.lab.completedCount === mission.lab.totalCount ? copy.labCompleted : copy.labAvailable}: {mission.lab.courseTitle} ·{" "}
                {mission.lab.completedCount}/{mission.lab.totalCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Link
          className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition hover:-translate-y-0.5 ${style.button}`}
          href={`/missions/${mission.id}`}
        >
          {copy.openMission}
          <ArrowRight className="size-5" />
        </Link>
        <button
          className="text-sm font-semibold text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
          onClick={onBrowseAll}
          type="button"
        >
          {copy.browseAllMissions}
        </button>
      </div>
    </section>
  );
}
