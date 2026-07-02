import { VerifyEmailPanel } from "@/components/verify-email-panel";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { requireUser } from "@/lib/supabase/auth";

export default async function VerifyEmailPage() {
  const language = await getLanguage();
  const copy = t(language);
  const session = await requireUser();
  const verified = Boolean(session.user.email_confirmed_at);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase text-violet">{copy.login.badge}</p>
        <h1 className="mt-3 text-4xl font-black">{copy.verifyEmail.title}</h1>
        <p className="mt-4 text-ink/70">{copy.verifyEmail.subtitle}</p>
      </div>
      <div className="mt-8">
        <VerifyEmailPanel email={session.user.email ?? null} labels={copy.verifyEmail} verified={verified} />
      </div>
    </main>
  );
}
