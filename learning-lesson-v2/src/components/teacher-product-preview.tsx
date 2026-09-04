import { KeyRound } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

const SAMPLE_ROWS = [
  { name: "Мария И.", lessons: 12, xp: 840, lastVisit: "днес / today" },
  { name: "Георги П.", lessons: 9, xp: 610, lastVisit: "вчера / yesterday" },
  { name: "Елена К.", lessons: 14, xp: 920, lastVisit: "преди 2 дни / 2d ago" }
] as const;

export function TeacherProductPreview({ language }: { language: Language }) {
  const copy = t(language).forTeachers;
  const isBg = language === "bg";

  const rows = SAMPLE_ROWS.map((row) => ({
    name: row.name,
    lessons: row.lessons,
    xp: row.xp,
    lastVisit: isBg ? row.lastVisit.split(" / ")[0] : row.lastVisit.split(" / ")[1]
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,16rem)]">
      <figure className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        <figcaption className="border-b border-ink/10 bg-ink/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/45">
          {copy.proofBadge}
        </figcaption>
        <div className="p-4 sm:p-5">
          <p className="font-display text-lg font-bold text-ink">{copy.proofTableTitle}</p>
          <p className="mt-1 text-sm text-ink/55">{copy.proofTableSubtitle}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: copy.proofStatStudents, value: "24" },
              { label: copy.proofStatLessons, value: "11" },
              { label: copy.proofStatXp, value: "680" }
            ].map((stat) => (
              <div className="rounded-xl bg-ink/5 px-3 py-3" key={stat.label}>
                <p className="text-[11px] font-semibold text-ink/50">{stat.label}</p>
                <p className="mt-1 text-xl font-black text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wide text-ink/45">
                  <th className="py-2 pr-3 font-bold">{copy.proofColStudent}</th>
                  <th className="py-2 pr-3 font-bold">{copy.proofColLessons}</th>
                  <th className="py-2 pr-3 font-bold">{copy.proofColXp}</th>
                  <th className="py-2 font-bold">{copy.proofColVisit}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-b border-ink/5 last:border-0" key={row.name}>
                    <td className="py-2.5 pr-3 font-semibold text-ink">{row.name}</td>
                    <td className="py-2.5 pr-3 text-ink/70">{row.lessons}</td>
                    <td className="py-2.5 pr-3 text-ink/70">{row.xp}</td>
                    <td className="py-2.5 text-ink/70">{row.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/45">{copy.proofPrivacyNote}</p>
        </div>
      </figure>

      <figure className="flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-ink text-paper shadow-soft">
        <figcaption className="border-b border-paper/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-paper/45">
          {copy.proofJoinBadge}
        </figcaption>
        <div className="flex flex-1 flex-col justify-center p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-mint text-ink">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-xl font-bold">{copy.proofJoinTitle}</p>
          <p className="mt-2 text-sm leading-6 text-paper/55">{copy.proofJoinText}</p>
          <p className="mt-6 rounded-xl border border-dashed border-mint/50 bg-mint/10 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.28em] text-mint">
            A1B2C3
          </p>
        </div>
      </figure>
    </div>
  );
}
