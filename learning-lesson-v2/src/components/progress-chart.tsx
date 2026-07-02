import { buildWeeklyProgressSeries, getMaxChartValue } from "@/lib/progress-chart";
import type { ProgressRecord } from "@/lib/types";

export function ProgressChart({
  progress,
  title,
  xpLabel,
  lessonsLabel
}: {
  progress: ProgressRecord[];
  title: string;
  xpLabel: string;
  lessonsLabel: string;
}) {
  const points = buildWeeklyProgressSeries(progress);
  const maxValue = getMaxChartValue(points);

  return (
    <section className="rounded-lg border border-ink/10 bg-paper/70 p-4">
      <h2 className="text-sm font-bold uppercase text-ink/60">{title}</h2>
      <div className="mt-5 grid grid-cols-8 items-end gap-2">
        {points.map((point) => {
          const height = Math.max(8, Math.round((point.xp / maxValue) * 100));

          return (
            <div className="flex flex-col items-center gap-2" key={point.label}>
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-md bg-violet transition-all"
                  style={{ height: `${height}%` }}
                  title={`${point.xp} ${xpLabel}`}
                />
              </div>
              <p className="text-center text-[10px] font-bold uppercase text-ink/45">{point.label}</p>
              <p className="text-center text-[10px] font-bold text-ink/70">
                {point.lessons} {lessonsLabel}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
