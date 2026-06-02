import { QuestSelection } from "@/components/quest-selection";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export default async function PathsPage() {
  const language = await getLanguage();
  const copy = t(language);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase text-mint">{copy.paths.badge}</p>
        <h1 className="mt-2 text-4xl font-black">{copy.paths.title}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{copy.paths.subtitle}</p>
      </div>
      <QuestSelection language={language} />
    </main>
  );
}
