import Link from "next/link";
import { Medal } from "lucide-react";
import type { QuestCertificate } from "@/lib/certificates";

export function QuestCertificates({
  certificates,
  title,
  earnedLabel,
  inProgressLabel,
  viewLabel
}: {
  certificates: QuestCertificate[];
  title: string;
  earnedLabel: string;
  inProgressLabel: string;
  viewLabel: string;
}) {
  const earned = certificates.filter((certificate) => certificate.earned);

  return (
    <section className="rounded-lg border border-ink/10 bg-paper/70 p-4">
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-ink/60">
        <Medal className="size-4 text-coral" />
        {title}
      </div>
      {earned.length === 0 ? (
        <p className="mt-4 text-sm text-ink/70">{inProgressLabel}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {earned.map((certificate) => (
            <article className="rounded-lg border border-mint/30 bg-mint/10 p-4" key={certificate.questId}>
              <p className="text-xs font-bold uppercase text-ink/45">{earnedLabel}</p>
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
      )}
    </section>
  );
}
