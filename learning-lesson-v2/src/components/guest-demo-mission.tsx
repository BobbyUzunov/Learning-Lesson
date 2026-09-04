"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

type Stage = "learn" | "do" | "check" | "done";

export function GuestDemoMission({ language }: { language: Language }) {
  const copy = t(language).demo;
  const [stage, setStage] = useState<Stage>("learn");
  const [built, setBuilt] = useState<string[]>([]);

  const pieces = [
    { id: "title", label: copy.pieceTitle },
    { id: "body", label: copy.pieceBody },
    { id: "cta", label: copy.pieceCta }
  ] as const;

  function togglePiece(id: string) {
    setBuilt((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function reset() {
    setStage("learn");
    setBuilt([]);
  }

  const doComplete = built.length === pieces.length;

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex gap-2" role="list" aria-label={copy.stagesLabel}>
        {(["learn", "do", "check"] as const).map((item, index) => {
          const active = stage === item || (stage === "done" && item === "check");
          const done =
            (item === "learn" && stage !== "learn") ||
            (item === "do" && (stage === "check" || stage === "done")) ||
            (item === "check" && stage === "done");
          return (
            <div
              className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                active ? "border-mint/50 bg-mint/15 text-ink" : "border-ink/10 bg-white/70 text-ink/45"
              }`}
              key={item}
              role="listitem"
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                  done ? "bg-mint text-ink" : "bg-ink/10 text-ink/60"
                }`}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              {item === "learn" ? copy.stageLearn : item === "do" ? copy.stageDo : copy.stageCheck}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white/90 p-5 shadow-soft sm:p-6">
        {stage === "learn" ? (
          <>
            <h2 className="font-display text-2xl font-bold text-ink">{copy.learnTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">{copy.learnBody}</p>
            <button
              className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
              onClick={() => setStage("do")}
              type="button"
            >
              {copy.learnCta}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </>
        ) : null}

        {stage === "do" ? (
          <>
            <h2 className="font-display text-2xl font-bold text-ink">{copy.doTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">{copy.doBody}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {pieces.map((piece) => {
                const selected = built.includes(piece.id);
                return (
                  <button
                    aria-pressed={selected}
                    className={`focus-ring min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      selected
                        ? "border-mint bg-mint/20 text-ink"
                        : "border-ink/15 bg-ink/5 text-ink/70 hover:border-ink/30"
                    }`}
                    key={piece.id}
                    onClick={() => togglePiece(piece.id)}
                    type="button"
                  >
                    {piece.label}
                  </button>
                );
              })}
            </div>
            <div
              aria-live="polite"
              className="mt-5 min-h-[7.5rem] rounded-xl border border-dashed border-ink/20 bg-paper/80 p-4"
            >
              {built.length === 0 ? (
                <p className="text-sm text-ink/40">{copy.doEmpty}</p>
              ) : (
                <div className="space-y-2">
                  {built.includes("title") ? (
                    <p className="font-display text-lg font-bold text-ink">{copy.sampleTitle}</p>
                  ) : null}
                  {built.includes("body") ? <p className="text-sm text-ink/65">{copy.sampleBody}</p> : null}
                  {built.includes("cta") ? (
                    <span className="inline-flex rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-paper">
                      {copy.sampleCta}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <button
              className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition enabled:hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!doComplete}
              onClick={() => setStage("check")}
              type="button"
            >
              {copy.doCta}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </>
        ) : null}

        {stage === "check" ? (
          <>
            <h2 className="font-display text-2xl font-bold text-ink">{copy.checkTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">{copy.checkBody}</p>
            <button
              className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-mint/90"
              onClick={() => setStage("done")}
              type="button"
            >
              {copy.checkCta}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </>
        ) : null}

        {stage === "done" ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mint">{copy.doneBadge}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">{copy.doneTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">{copy.doneBody}</p>
            <p className="mt-4 inline-flex rounded-xl bg-mint/20 px-3 py-2 text-sm font-black text-ink">
              {copy.xpEarned}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-ink/90"
                href="/register"
              >
                {copy.registerCta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <button
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-ink/30 hover:text-ink"
                onClick={reset}
                type="button"
              >
                <RotateCcw className="size-4" aria-hidden />
                {copy.resetCta}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
