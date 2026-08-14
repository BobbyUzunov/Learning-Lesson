import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { HomeHeroMotion } from "@/components/home-hero-motion";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getCurrentSession } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const particles = [
  { left: "5%", top: "84%", size: 6, color: "bg-mint/70", duration: "11s", delay: "0s", opacity: 0.55, x: "18px" },
  { left: "14%", top: "94%", size: 4, color: "bg-paper/60", duration: "14s", delay: "2.2s", opacity: 0.4, x: "-12px" },
  { left: "24%", top: "88%", size: 5, color: "bg-violet/70", duration: "12.5s", delay: "4.6s", opacity: 0.5, x: "22px" },
  { left: "36%", top: "96%", size: 3, color: "bg-mint/60", duration: "15s", delay: "1.4s", opacity: 0.45, x: "-8px" },
  { left: "48%", top: "90%", size: 7, color: "bg-coral/55", duration: "13s", delay: "3.8s", opacity: 0.42, x: "16px" },
  { left: "61%", top: "95%", size: 4, color: "bg-paper/60", duration: "11.5s", delay: "0.9s", opacity: 0.4, x: "-18px" },
  { left: "73%", top: "86%", size: 5, color: "bg-mint/70", duration: "14.5s", delay: "5.4s", opacity: 0.5, x: "10px" },
  { left: "84%", top: "92%", size: 3, color: "bg-violet/60", duration: "12s", delay: "2.8s", opacity: 0.45, x: "-14px" },
  { left: "91%", top: "80%", size: 6, color: "bg-paper/50", duration: "16s", delay: "6.2s", opacity: 0.38, x: "8px" },
  { left: "8%", top: "70%", size: 3, color: "bg-coral/50", duration: "13.5s", delay: "7s", opacity: 0.35, x: "24px" }
] as const;

const sparks = [
  { left: "-1.1rem", top: "0.85rem", delay: "0.2s", size: 7 },
  { left: "42%", top: "-0.55rem", delay: "1.1s", size: 5 },
  { left: "calc(100% - 0.2rem)", top: "1.4rem", delay: "0.7s", size: 6 },
  { left: "72%", top: "calc(100% - 0.2rem)", delay: "1.8s", size: 4 }
] as const;

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
        <HomeHeroMotion>
          <span aria-hidden className="home-grid" />
          <span aria-hidden className="home-grain" />
          <span aria-hidden className="home-spotlight" />
          <span aria-hidden className="home-comet" />

          <span className="pointer-events-none absolute -left-24 top-0 size-[28rem] animate-home-orb rounded-full bg-mint/28 blur-3xl" />
          <span className="pointer-events-none absolute -right-16 bottom-0 size-[32rem] animate-home-orb-alt rounded-full bg-coral/22 blur-3xl" />
          <span
            className="pointer-events-none absolute left-1/3 top-1/4 size-[22rem] animate-home-orb rounded-full bg-violet/22 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />
          {particles.map((particle, index) => (
            <span
              aria-hidden
              className={`home-particle ${particle.color}`}
              key={index}
              style={
                {
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                  "--particle-duration": particle.duration,
                  "--particle-delay": particle.delay,
                  "--particle-opacity": particle.opacity,
                  "--particle-x": particle.x
                } as CSSProperties
              }
            />
          ))}

          <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col justify-center px-4 py-14 sm:py-16">
            <div className="relative w-fit">
              {sparks.map((spark, index) => (
                <span
                  aria-hidden
                  className="home-sparkle"
                  key={index}
                  style={{
                    left: spark.left,
                    top: spark.top,
                    width: spark.size,
                    height: spark.size,
                    animationDelay: spark.delay
                  }}
                />
              ))}
              <p className="home-brand font-display text-[clamp(2.75rem,8vw,5.25rem)] font-bold leading-[1.08] tracking-tight">
                {copy.brand}
              </p>
            </div>
            <h1
              className="mt-6 max-w-2xl animate-home-rise font-display text-[clamp(1.65rem,3.6vw,2.6rem)] font-semibold leading-tight text-paper/92"
              style={{ animationDelay: "140ms" }}
            >
              {copy.title}
            </h1>
            <p
              className="mt-4 max-w-xl animate-home-rise text-base leading-7 text-paper/60 sm:text-lg sm:leading-8"
              style={{ animationDelay: "240ms" }}
            >
              {copy.subtitle}
            </p>

            <p
              className="mt-10 animate-home-rise text-[11px] font-bold uppercase tracking-[0.14em] text-paper/40"
              style={{ animationDelay: "340ms" }}
            >
              {copy.chooseRoleTitle}
            </p>

            <div className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="animate-home-card-in" style={{ animationDelay: "520ms" }}>
                <div className="h-full animate-home-float" style={{ animationDelay: "1.1s" }}>
                  <Link
                    className="home-card group block h-full rounded-2xl border border-paper/15 bg-paper/5 p-5 transition duration-300 hover:border-mint/50 hover:bg-paper/10"
                    href="/register"
                    style={{ "--sheen-delay": "1.5s" } as CSSProperties}
                  >
                    <span className="home-icon relative grid size-10 place-items-center rounded-xl bg-mint text-ink">
                      <span aria-hidden className="home-icon-ring" />
                      <GraduationCap className="relative size-5 transition duration-300 group-hover:scale-105" />
                    </span>
                    <h2 className="mt-4 font-display text-xl font-bold tracking-tight">{copy.studentCardTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-paper/55">{copy.studentCardBody}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mint">
                      {copy.primaryCta}
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="animate-home-card-in" style={{ animationDelay: "700ms" }}>
                <div className="h-full animate-home-float" style={{ animationDelay: "1.55s" }}>
                  <Link
                    className="home-card group block h-full rounded-2xl border border-paper/15 bg-paper/5 p-5 transition duration-300 hover:border-paper/40 hover:bg-paper/10"
                    href="/register/teacher"
                    style={{ "--sheen-delay": "1.9s" } as CSSProperties}
                  >
                    <span className="home-icon relative grid size-10 place-items-center rounded-xl bg-paper text-ink">
                      <span aria-hidden className="home-icon-ring home-icon-ring-paper" />
                      <Users className="relative size-5 transition duration-300 group-hover:scale-105" />
                    </span>
                    <h2 className="mt-4 font-display text-xl font-bold tracking-tight">{copy.teacherCardTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-paper/55">{copy.teacherCardBody}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-paper/80">
                      {copy.teacherCta}
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <p
              className="mt-8 animate-home-rise text-[11px] font-bold uppercase tracking-[0.14em] text-paper/40"
              style={{ animationDelay: "780ms" }}
            >
              {copy.howTitle}
            </p>
            <ol className="mt-3 grid max-w-2xl gap-2 sm:grid-cols-3">
              {[copy.howStep1, copy.howStep2, copy.howStep3].map((step, index) => (
                <li
                  className="animate-home-rise flex items-start gap-2.5 rounded-xl border border-paper/10 bg-paper/[0.04] px-3 py-2.5"
                  key={step}
                  style={{ animationDelay: `${860 + index * 90}ms` }}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-5 text-paper/70">{step}</span>
                </li>
              ))}
            </ol>

            <Link
              className="mt-8 inline-flex animate-home-rise text-sm font-semibold text-paper/70 underline-offset-4 transition hover:text-paper hover:underline"
              href="/login"
              style={{ animationDelay: "1120ms" }}
            >
              {copy.hasAccount}
            </Link>
          </div>
        </HomeHeroMotion>
      </section>
    </main>
  );
}
