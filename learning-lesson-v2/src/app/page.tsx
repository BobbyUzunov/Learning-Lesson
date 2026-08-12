import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [language, session] = await Promise.all([getLanguage(), getCurrentSession()]);

  if (session.isAdmin) {
    redirect("/admin");
  }
  if (session.isTeacher) {
    redirect("/teacher");
  }
  if (session.user) {
    redirect("/dashboard");
  }

  const copy = t(language).home;

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-paper">
        <span className="pointer-events-none absolute -left-24 top-0 size-[28rem] rounded-full bg-mint/25 blur-3xl" />
        <span className="pointer-events-none absolute -right-16 bottom-0 size-[32rem] rounded-full bg-coral/20 blur-3xl" />
        <span className="pointer-events-none absolute left-1/3 top-1/4 size-[22rem] rounded-full bg-violet/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-4 py-14 sm:py-16">
          <div className="animate-home-rise max-w-3xl">
            <p className="font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[0.92] tracking-tight">
              {copy.brand}
            </p>
            <h1 className="mt-6 max-w-2xl font-display text-[clamp(1.65rem,3.6vw,2.6rem)] font-semibold leading-tight text-paper/92">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-paper/60 sm:text-lg sm:leading-8">{copy.subtitle}</p>

            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.14em] text-paper/40">
              {copy.chooseRoleTitle}
            </p>

            <div className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
              <Link
                className="group rounded-2xl border border-paper/15 bg-paper/5 p-5 transition hover:border-mint/40 hover:bg-paper/10"
                href="/register"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-mint text-ink">
                  <GraduationCap className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold tracking-tight">{copy.studentCardTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-paper/55">{copy.studentCardBody}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mint">
                  {copy.primaryCta}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                className="group rounded-2xl border border-paper/15 bg-paper/5 p-5 transition hover:border-mint/40 hover:bg-paper/10"
                href="/register/teacher"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-paper text-ink">
                  <Users className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold tracking-tight">{copy.teacherCardTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-paper/55">{copy.teacherCardBody}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-paper/80">
                  {copy.teacherCta}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>

            <Link
              className="mt-8 inline-flex text-sm font-semibold text-paper/70 underline-offset-4 transition hover:text-paper hover:underline"
              href="/login"
            >
              {copy.hasAccount}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
