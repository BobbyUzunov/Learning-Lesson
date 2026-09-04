import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getContactEmail, getOperatorName } from "@/lib/site-contact";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const language = await getLanguage();
  const copy = t(language).terms;
  const operator = getOperatorName(language);
  const email = getContactEmail();

  const sections = [
    { title: copy.sections.service.title, body: copy.sections.service.body },
    { title: copy.sections.accounts.title, body: copy.sections.accounts.body },
    { title: copy.sections.schools.title, body: copy.sections.schools.body },
    { title: copy.sections.acceptable.title, body: copy.sections.acceptable.body },
    {
      title: copy.sections.liability.title,
      body: copy.sections.liability.body.replace("{operator}", operator)
    },
    {
      title: copy.sections.contact.title,
      body: copy.sections.contact.body.replace("{email}", email)
    }
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.badge}</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-sm font-semibold text-ink/55">{copy.updated}</p>
      <p className="mt-6 text-base leading-7 text-ink/75">{copy.intro}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section className="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft" key={section.title}>
            <h2 className="text-lg font-black text-ink">{section.title}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-ink/50">
        <Link className="font-semibold underline-offset-4 hover:underline" href="/privacy">
          {copy.privacyLink}
        </Link>
        {" · "}
        <Link className="font-semibold underline-offset-4 hover:underline" href="/contact">
          {copy.contactLink}
        </Link>
      </p>
    </main>
  );
}
