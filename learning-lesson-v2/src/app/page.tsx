import Link from "next/link";
import { ArrowRight, Trophy, Route, ShieldCheck } from "lucide-react";
import { learningPaths } from "@/lib/data";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <p className="text-sm font-bold uppercase text-coral">Version 2 MVP</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            Learning Lesson
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            A cleaner learning platform foundation with auth, paths, lessons, XP, levels, and Supabase progress.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-bold text-paper transition hover:bg-ink/90"
              href="/dashboard"
            >
              Open dashboard
              <ArrowRight className="size-5" />
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-ink/15 px-5 py-3 font-bold transition hover:bg-white/70"
              href="/paths"
            >
              Browse paths
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/75 p-5 shadow-soft">
          <div className="grid gap-3">
            {learningPaths.map((path) => (
              <Link
                className="group rounded-lg border border-ink/10 bg-paper/70 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                href="/paths"
                key={path.id}
              >
                <div className="flex items-center gap-3">
                  <span className={`size-3 rounded-full ${path.color}`} />
                  <h2 className="font-bold">{path.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/70">{path.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-ink/10 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          {[
            { icon: Route, title: "Structured paths", text: "Lessons are grouped into clear tracks." },
            { icon: Trophy, title: "XP and levels", text: "Completion creates visible progression." },
            { icon: ShieldCheck, title: "Supabase-ready", text: "Auth and progress persistence are wired in." }
          ].map((item) => (
            <div className="rounded-lg p-4" key={item.title}>
              <item.icon className="size-6 text-violet" />
              <h3 className="mt-3 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
