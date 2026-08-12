import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

type LoginPageProps = {
  searchParams: Promise<{ message?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { message, redirect } = await searchParams;
  const redirectPath = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";
  const displayMessage =
    message === "admin_allowlist"
      ? copy.admin.allowlistMessage
      : message
        ? message
        : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mint">{copy.login.badge}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.login.title}</h1>
        <p className="mt-3 text-base leading-7 text-ink/60">{copy.login.subtitle}</p>
        {displayMessage ? (
          <p className="mt-4 rounded-xl bg-mint/15 px-4 py-3 text-sm font-bold text-ink">{displayMessage}</p>
        ) : null}
      </div>

      <div className="mt-8">
        <LoginForm labels={copy.login} redirectPath={redirectPath} />
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-sm text-ink/55">
        <Link className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline" href="/register">
          {copy.login.goToStudentRegister}
        </Link>
        <span className="mx-2 text-ink/25">·</span>
        <Link
          className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline"
          href="/register/teacher"
        >
          {copy.login.goToTeacherRegister}
        </Link>
      </p>
    </main>
  );
}
