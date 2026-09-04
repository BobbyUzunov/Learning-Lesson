import Link from "next/link";
import { GuestDemoMission } from "@/components/guest-demo-mission";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const language = await getLanguage();
  const copy = t(language).demo;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mint">{copy.badge}</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink/60">{copy.subtitle}</p>
      <p className="mt-2 text-sm text-ink/45">{copy.noAccountNote}</p>

      <div className="mt-8">
        <GuestDemoMission language={language} />
      </div>

      <p className="mt-10 text-center text-sm text-ink/50">
        <Link className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline" href="/">
          {copy.backHome}
        </Link>
        {" · "}
        <Link
          className="font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline"
          href="/for-teachers"
        >
          {copy.forTeachersLink}
        </Link>
      </p>
    </main>
  );
}
