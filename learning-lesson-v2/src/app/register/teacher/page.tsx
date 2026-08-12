import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function TeacherRegisterPage() {
  const language = await getLanguage();
  const copy = t(language);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mint">
          {copy.login.teacherRegisterBadge}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.login.teacherRegisterTitle}
        </h1>
        <p className="mt-3 text-base leading-7 text-ink/60">{copy.login.teacherRegisterSubtitle}</p>

        <ol className="mt-6 grid gap-2 text-sm text-ink/65">
          <li className="rounded-xl border border-ink/10 bg-white/70 px-4 py-3">
            <span className="font-bold text-ink">1.</span> {copy.login.teacherRegisterHint1}
          </li>
          <li className="rounded-xl border border-ink/10 bg-white/70 px-4 py-3">
            <span className="font-bold text-ink">2.</span> {copy.login.teacherRegisterHint2}
          </li>
          <li className="rounded-xl border border-ink/10 bg-white/70 px-4 py-3">
            <span className="font-bold text-ink">3.</span> {copy.login.teacherRegisterHint3}
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <LoginForm accountRole="teacher" initialMode="register" labels={copy.login} redirectPath="/teacher" />
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2 text-center text-sm text-ink/55">
        <Link className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline" href="/login">
          {copy.login.goToLogin}
        </Link>
        <Link
          className="font-semibold text-ink/50 underline-offset-4 hover:text-ink/70 hover:underline"
          href="/register"
        >
          {copy.login.goToStudentRegister}
        </Link>
      </div>
    </main>
  );
}
