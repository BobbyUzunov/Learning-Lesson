import Link from "next/link";
import { ArrowRight, KeyRound, LineChart, Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function ForTeachersPage() {
  const language = await getLanguage();
  const copy = t(language).forTeachers;
  const session = await getCurrentSession();

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-paper">
        <span className="pointer-events-none absolute -left-20 top-8 size-[24rem] rounded-full bg-mint/20 blur-3xl" />
        <span className="pointer-events-none absolute -right-16 bottom-0 size-[28rem] rounded-full bg-violet/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint/80">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-paper/60 sm:text-lg sm:leading-8">{copy.subtitle}</p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            {session.isTeacher ? (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:bg-mint/90"
                href="/teacher"
              >
                {copy.panelCta}
                <ArrowRight className="size-5" />
              </Link>
            ) : (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 font-bold text-ink transition hover:bg-mint/90"
                href="/login"
              >
                {copy.loginCta}
                <ArrowRight className="size-5" />
              </Link>
            )}
            <Link className="text-sm font-semibold text-paper/70 underline-offset-4 transition hover:text-paper hover:underline" href="/">
              {copy.backHome}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.howTitle}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{copy.howSubtitle}</p>

          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              { icon: Users, title: copy.step1Title, text: copy.step1Text },
              { icon: KeyRound, title: copy.step2Title, text: copy.step2Text },
              { icon: LineChart, title: copy.step3Title, text: copy.step3Text }
            ].map((step) => (
              <li key={step.title}>
                <span className="grid size-11 place-items-center rounded-xl bg-ink text-paper">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/65">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.accessTitle}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{copy.accessText}</p>
          <p className="mt-4 text-sm text-ink/45">{copy.accessHint}</p>
        </div>
      </section>
    </main>
  );
}
