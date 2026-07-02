import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function ForgotPasswordPage() {
  const language = await getLanguage();
  const copy = t(language);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase text-violet">{copy.login.badge}</p>
        <h1 className="mt-3 text-4xl font-black">{copy.login.forgotTitle}</h1>
        <p className="mt-4 text-ink/70">{copy.login.forgotSubtitle}</p>
      </div>
      <div className="mt-8">
        <ForgotPasswordForm labels={copy.login} />
      </div>
    </main>
  );
}
