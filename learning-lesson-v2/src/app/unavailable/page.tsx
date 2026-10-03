import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function UnavailablePage({
  searchParams
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const language = await getLanguage();
  const copy = t(language);
  const { code } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {copy.common.temporarilyUnavailableTitle}
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">{copy.common.temporarilyUnavailableMessage}</p>
      {code ? <p className="mt-2 font-mono text-xs text-ink/40">{code}</p> : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper" href="/dashboard">
          {copy.common.tryAgain}
        </Link>
        <Link className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-bold" href="/">
          {copy.common.home}
        </Link>
      </div>
    </main>
  );
}
