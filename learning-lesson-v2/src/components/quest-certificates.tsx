import Link from "next/link";
import { AlertCircle, CheckCircle2, Circle, Medal } from "lucide-react";
import type { CertificateBlocker, QuestCertificate } from "@/lib/certificates";
import { formatMessage, t, type Language } from "@/lib/i18n";

function BlockerItem({
  blocker,
  language,
  viewProjectLabel
}: {
  blocker: CertificateBlocker;
  language: Language;
  viewProjectLabel: string;
}) {
  const copy = t(language);

  if (blocker.type === "lessons") {
    return (
      <li className="flex items-start gap-2 text-sm leading-6 text-ink/75">
        <Circle className="mt-0.5 size-4 shrink-0 text-coral" />
        <span>{formatMessage(copy.certificates.lessonsRemaining, { remaining: blocker.remaining })}</span>
      </li>
    );
  }

  const projectHref = `/projects/${blocker.projectId}`;
  let label = formatMessage(copy.certificates.submitProject, { project: blocker.projectTitle });

  if (blocker.type === "project_pending_review") {
    label = copy.certificates.capstonePendingReview;
  } else if (blocker.type === "project_needs_changes") {
    label = copy.certificates.capstoneNeedsChanges;
  }

  const Icon =
    blocker.type === "project_needs_changes"
      ? AlertCircle
      : blocker.type === "project_pending_review"
        ? Circle
        : Circle;

  return (
    <li className="flex flex-col gap-2 text-sm leading-6 text-ink/75 sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-start gap-2">
        <Icon
          className={`mt-0.5 size-4 shrink-0 ${blocker.type === "project_needs_changes" ? "text-coral" : "text-violet"}`}
        />
        <span>{label}</span>
      </span>
      <Link className="inline-flex rounded-md border border-ink/15 px-3 py-1.5 text-xs font-bold text-ink" href={projectHref}>
        {viewProjectLabel}
      </Link>
    </li>
  );
}

export function QuestCertificates({
  certificates,
  language,
  title,
  earnedLabel,
  inProgressLabel,
  inProgressTitle,
  viewLabel,
  viewProjectLabel
}: {
  certificates: QuestCertificate[];
  language: Language;
  title: string;
  earnedLabel: string;
  inProgressLabel: string;
  inProgressTitle: string;
  viewLabel: string;
  viewProjectLabel: string;
}) {
  const earned = certificates.filter((certificate) => certificate.earned);
  const inProgress = certificates.filter((certificate) => certificate.inProgress);

  return (
    <section className="rounded-lg border border-ink/10 bg-paper/70 p-4">
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
        <Medal className="size-4 text-coral" />
        {title}
      </div>

      {earned.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {earned.map((certificate) => (
            <article className="rounded-lg border border-mint/30 bg-mint/10 p-4" key={certificate.questId}>
              <p className="inline-flex items-center gap-1 text-xs font-bold uppercase text-ink/45">
                <CheckCircle2 className="size-3.5 text-mint" />
                {earnedLabel}
              </p>
              <h3 className="mt-2 text-xl font-black">{certificate.title}</h3>
              <p className="mt-1 text-sm text-ink/70">{certificate.badge}</p>
              <Link
                className="mt-4 inline-flex rounded-md border border-ink/15 px-3 py-2 text-sm font-bold"
                href={`/certificate/${certificate.questId}`}
              >
                {viewLabel}
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {inProgress.length > 0 ? (
        <div className={earned.length > 0 ? "mt-6" : "mt-4"}>
          <p className="text-sm font-bold uppercase text-ink/55">{inProgressTitle}</p>
          <div className="mt-3 grid gap-3">
            {inProgress.map((certificate) => (
              <article className="rounded-lg border border-violet/20 bg-violet/5 p-4" key={certificate.questId}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-black">{certificate.title}</h3>
                  <p className="text-xs font-bold uppercase text-ink/50">
                    {certificate.completedCount}/{certificate.totalCount}
                  </p>
                </div>
                <ul className="mt-3 space-y-2">
                  {certificate.blockers.map((blocker) => (
                    <BlockerItem
                      blocker={blocker}
                      key={`${certificate.questId}-${blocker.type}-${"projectId" in blocker ? blocker.projectId : blocker.remaining}`}
                      language={language}
                      viewProjectLabel={viewProjectLabel}
                    />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {earned.length === 0 && inProgress.length === 0 ? (
        <p className="mt-4 text-sm text-ink/70">{inProgressLabel}</p>
      ) : null}
    </section>
  );
}
