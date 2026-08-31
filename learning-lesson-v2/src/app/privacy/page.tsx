import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const metadata = {
  robots: { index: true, follow: true }
};

export default async function PrivacyPage() {
  const language = await getLanguage();
  const copy = t(language);
  const sections = [
    copy.privacy.sections.controller,
    copy.privacy.sections.dataCollected,
    copy.privacy.sections.purposes,
    copy.privacy.sections.mentor,
    copy.privacy.sections.retention,
    copy.privacy.sections.rights,
    copy.privacy.sections.contact
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.privacy.badge}</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.privacy.title}</h1>
      <p className="mt-3 text-sm font-semibold text-ink/55">{copy.privacy.updated}</p>
      <p className="mt-6 text-base leading-7 text-ink/75">{copy.privacy.intro}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={section.title}>
            <h2 className="text-lg font-black text-ink">{section.title}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-mint/25 bg-mint/10 p-5">
        <h2 className="text-lg font-black text-ink">{copy.privacy.actionsTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/70">{copy.privacy.actionsBody}</p>
        <Link
          className="focus-ring mt-4 inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
          href="/profile"
        >
          {copy.privacy.actionsLink}
        </Link>
      </div>
    </main>
  );
}
