import Link from "next/link";
import { notFound } from "next/navigation";
import { Medal } from "lucide-react";
import { CertificateActions } from "@/components/certificate-actions";
import { getEarnedCertificates } from "@/lib/certificates";
import { getCourseCatalog, getQuestFromCatalog } from "@/lib/catalog";
import { getCourseProjects } from "@/lib/projects/store";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { toGameProgress } from "@/lib/game-progress";
import { requireUser } from "@/lib/supabase/auth";
import { getCurrentUserProjectSubmissions } from "@/lib/supabase/project-submissions";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type CertificatePageProps = {
  params: Promise<{ questId: string }>;
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  const [{ questId }, catalog, { projects }, language, session] = await Promise.all([
    params,
    getCourseCatalog(),
    getCourseProjects(),
    getLanguage(),
    requireUser()
  ]);
  const quest = getQuestFromCatalog(catalog, questId);
  if (!quest) {
    notFound();
  }

  const copy = t(language);
  const [{ progress }, submissions] = await Promise.all([
    getCurrentUserProgress(),
    getCurrentUserProjectSubmissions()
  ]);
  const gameProgress = toGameProgress(progress);
  const earned = getEarnedCertificates(gameProgress, language, progress, submissions, catalog.courses, projects).find(
    (item) => item.questId === questId
  );

  if (!earned) {
    notFound();
  }

  const localizedQuest = localizeGameQuest(quest, language);
  const learnerName =
    session.profile?.display_name ??
    session.profile?.email?.split("@")[0] ??
    session.user.email?.split("@")[0] ??
    copy.common.learner;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <section className="rounded-lg border-2 border-ink/15 bg-white p-5 text-center shadow-soft sm:p-8" id="certificate-printable">
        <Medal className="mx-auto size-12 text-coral" />
        <p className="mt-4 text-sm font-bold uppercase text-violet">{copy.certificates.badge}</p>
        <h1 className="mt-3 break-words text-3xl font-black sm:text-4xl">{copy.certificates.title}</h1>
        <p className="mt-4 text-lg text-ink/70">{copy.certificates.awardedTo}</p>
        <p className="mt-2 break-words text-2xl font-black sm:text-3xl">{learnerName}</p>
        <p className="mt-6 text-sm font-bold uppercase text-ink/45">{copy.certificates.forQuest}</p>
        <p className="mt-2 break-words text-xl font-black sm:text-2xl">{localizedQuest.title}</p>
        <p className="mt-2 text-sm text-ink/70">{localizedQuest.description}</p>
        <p className="mt-6 inline-flex rounded-md bg-mint/20 px-4 py-2 text-sm font-bold">{localizedQuest.rewardBadge}</p>
        {earned.earnedAt ? (
          <p className="mt-6 text-xs font-bold uppercase text-ink/45">
            {copy.certificates.earnedOn} {new Date(earned.earnedAt).toLocaleDateString(language === "bg" ? "bg-BG" : "en-GB")}
          </p>
        ) : null}
      </section>
      <CertificateActions language={language} />
      <div className="no-print mt-6 flex justify-center gap-3">
        <Link className="rounded-md bg-ink px-4 py-3 font-bold text-paper" href="/profile">
          {copy.nav.profile}
        </Link>
        <Link className="rounded-md border border-ink/15 px-4 py-3 font-bold" href="/paths">
          {copy.nav.paths}
        </Link>
      </div>
    </main>
  );
}
