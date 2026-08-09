import type {
  AssessmentQuestionAnalysis,
  AssessmentReportRow,
  AssessmentReportSummary
} from "@/lib/assessments/types";
import { shortStudentId } from "@/lib/classrooms/types";
import { t, type Language } from "@/lib/i18n";

function formatDate(value: string | null, language: Language, fallback: string) {
  if (!value) {
    return fallback;
  }
  return new Date(value).toLocaleString(language === "bg" ? "bg-BG" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const HARD_QUESTION_THRESHOLD = 60;

export function AssessmentReport({
  analysis,
  language,
  rows,
  summary
}: {
  analysis: AssessmentQuestionAnalysis[];
  language: Language;
  rows: AssessmentReportRow[];
  summary: AssessmentReportSummary;
}) {
  const copy = t(language).assessment;
  const missingRows = rows.filter((row) => row.status === "missing");
  const submittedRows = rows.filter((row) => row.status === "submitted");
  const hardQuestions = analysis
    .filter((question) => question.answeredCount > 0 && question.correctPercentage < HARD_QUESTION_THRESHOLD)
    .slice()
    .sort((left, right) => left.correctPercentage - right.correctPercentage)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="text-xl font-black">{copy.reportTitle}</h2>
        <p className="mt-2 text-sm text-ink/65">{copy.reportSubtitle}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [copy.summaryStudents, summary.studentCount],
            [copy.summarySubmitted, summary.submittedCount],
            [copy.summaryMissing, summary.missingCount],
            [copy.summaryAverage, `${summary.averagePercentage}%`],
            [copy.summaryHighest, `${summary.highestPercentage}%`]
          ].map(([label, value]) => (
            <div className="rounded-lg bg-ink/5 p-4" key={label}>
              <p className="text-xs font-bold uppercase text-ink/50">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-4 py-3">{copy.colStudent}</th>
                <th className="px-4 py-3">{copy.colStatus}</th>
                <th className="px-4 py-3">{copy.colResult}</th>
                <th className="px-4 py-3">{copy.colSubmitted}</th>
              </tr>
            </thead>
            <tbody>
              {[...missingRows, ...submittedRows].map((row) => (
                <tr className="border-t border-ink/10" key={row.studentId}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{row.displayName || copy.colStudent}</p>
                    <p className="font-mono text-xs text-ink/45">{shortStudentId(row.studentId)}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {row.status === "submitted" ? copy.statusSubmitted : copy.notSubmitted}
                  </td>
                  <td className="px-4 py-3 font-black">
                    {row.percentage === null ? copy.never : `${row.score}/${row.maxScore} · ${row.percentage}%`}
                  </td>
                  <td className="px-4 py-3">{formatDate(row.submittedAt, language, copy.never)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="text-xl font-black">{copy.missingStudentsTitle}</h2>
        <p className="mt-2 text-sm text-ink/65">{copy.missingStudentsSubtitle}</p>
        {missingRows.length === 0 ? (
          <p className="mt-4 text-sm font-semibold text-ink/60">{copy.allSubmitted}</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {missingRows.map((row) => (
              <li className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-3 text-sm font-bold" key={row.studentId}>
                {row.displayName || shortStudentId(row.studentId)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="text-xl font-black">{copy.hardestQuestionsTitle}</h2>
        <p className="mt-2 text-sm text-ink/65">{copy.hardestQuestionsSubtitle}</p>
        {hardQuestions.length === 0 ? (
          <p className="mt-4 text-sm font-semibold text-ink/60">{copy.noHardQuestions}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {hardQuestions.map((question) => (
              <div className="rounded-lg border border-violet/20 bg-violet/5 p-4" key={question.questionId}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="max-w-2xl font-bold">
                    {question.position + 1}. {question.prompt}
                  </p>
                  <p className="shrink-0 text-sm font-black text-coral">{question.correctPercentage}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/80 p-5 shadow-soft">
        <h2 className="text-xl font-black">{copy.questionAnalysisTitle}</h2>
        <div className="mt-4 space-y-4">
          {analysis.map((question) => (
            <div className="rounded-lg border border-ink/10 p-4" key={question.questionId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-2xl font-bold">
                  {question.position + 1}. {question.prompt}
                </p>
                <p className="shrink-0 text-sm font-black text-violet">{question.correctPercentage}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-violet"
                  style={{ width: `${Math.min(100, question.correctPercentage)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink/55">
                {question.correctCount}/{question.answeredCount} {copy.correctAnswers}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
