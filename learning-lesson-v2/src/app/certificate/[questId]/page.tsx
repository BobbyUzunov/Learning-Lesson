import Link from "next/link";
import { notFound } from "next/navigation";
import { Medal } from "lucide-react";
import { getEarnedCertificates } from "@/lib/certificates";
import { getQuestById } from "@/lib/game-data";
import { localizeGameQuest, t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { toGameProgress } from "@/lib/game-progress";
import { requireUser } from "@/lib/supabase/auth";
import { getCurrentUserProjectSubmissions, toSubmittedProjectIds } from "@/lib/supabase/project-submissions";
import { getCurrentUserProgress } from "@/lib/supabase/progress";

type CertificatePageProps = {
  params: Promise<{ questId: string }>;
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { questId } = await params;
  const quest = getQuestById(questId);
  if (!quest) {
    notFound();
  }

  const language = await getLanguage();
  const copy = t(language);
  const session = await requireUser();
  const { progress } = await getCurrentUserProgress();
  const submissions = await getCurrentUserProjectSubmissions();
  const submittedProjectIds = toSubmittedProjectIds(submissions);
  const gameProgress = toGameProgress(progress);
  const earned = getEarnedCertificates(gameProgress, language, progress, submittedProjectIds).find(
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <section className="rounded-lg border-2 border-ink/15 bg-white p-8 text-center shadow-soft">
        <Medal className="mx-auto size-12 text-coral" />
        <p className="mt-4 text-sm font-bold uppercase text-violet">{copy.certificates.badge}</p>
        <h1 className="mt-3 text-4xl font-black">{copy.certificates.title}</h1>
        <p className="mt-4 text-lg text-ink/70">{copy.certificates.awardedTo}</p>
        <p className="mt-2 text-3xl font-black">{learnerName}</p>
        <p className="mt-6 text-sm font-bold uppercase text-ink/45">{copy.certificates.forQuest}</p>
        <p className="mt-2 text-2xl font-black">{localizedQuest.title}</p>
        <p className="mt-2 text-sm text-ink/70">{localizedQuest.description}</p>
        <p className="mt-6 inline-flex rounded-md bg-mint/20 px-4 py-2 text-sm font-bold">{localizedQuest.rewardBadge}</p>
        {earned.earnedAt ? (
          <p className="mt-6 text-xs font-bold uppercase text-ink/45">
            {copy.certificates.earnedOn} {new Date(earned.earnedAt).toLocaleDateString(language === "bg" ? "bg-BG" : "en-GB")}
          </p>
        ) : null}
      </section>
      <div className="mt-6 flex justify-center gap-3">
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
