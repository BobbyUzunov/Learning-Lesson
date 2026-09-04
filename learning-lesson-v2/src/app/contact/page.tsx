import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getContactEmail, getContactMailto, getOperatorName } from "@/lib/site-contact";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const language = await getLanguage();
  const copy = t(language).contact;
  const email = getContactEmail();
  const operator = getOperatorName(language);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.badge}</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-base leading-7 text-ink/70">{copy.intro}</p>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">{copy.operatorTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/70">{operator}</p>
        <p className="mt-4 text-sm text-ink/55">{copy.emailLabel}</p>
        <a
          className="focus-ring mt-1 inline-flex min-h-11 items-center text-base font-bold text-ink underline-offset-4 hover:underline"
          href={getContactMailto(copy.mailSubject)}
        >
          {email}
        </a>
        <p className="mt-4 text-sm leading-7 text-ink/60">{copy.sla}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-mint/25 bg-mint/10 p-5">
        <h2 className="text-lg font-black text-ink">{copy.pilotTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-ink/70">{copy.pilotBody}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
            href={getContactMailto(copy.pilotMailSubject)}
          >
            {copy.pilotCta}
          </a>
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-ink/30"
            href="/register/teacher"
          >
            {copy.registerTeacherCta}
          </Link>
        </div>
      </section>

      <p className="mt-8 text-sm text-ink/50">
        <Link className="font-semibold underline-offset-4 hover:underline" href="/privacy">
          {copy.privacyLink}
        </Link>
        {" · "}
        <Link className="font-semibold underline-offset-4 hover:underline" href="/terms">
          {copy.termsLink}
        </Link>
      </p>
    </main>
  );
}
