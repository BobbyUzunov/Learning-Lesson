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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase text-violet">{copy.login.badge}</p>
        <h1 className="mt-3 text-4xl font-black">{copy.login.title}</h1>
        <p className="mt-4 text-ink/70">{copy.login.subtitle}</p>
        {message ? <p className="mt-4 rounded-md bg-mint/15 px-3 py-2 text-sm font-bold text-ink">{message}</p> : null}
      </div>
      <div className="mt-8">
        <LoginForm labels={copy.login} redirectPath={redirectPath} />
      </div>
    </main>
  );
}
