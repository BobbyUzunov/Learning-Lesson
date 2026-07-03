import Link from "next/link";
import { getQuizContent } from "@/lib/quiz";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const language = await getLanguage();
  const copy = t(language);
  const quiz = await getQuizContent();
  const questions = quiz.questions.slice().sort((left, right) => {
    if (left.topic === right.topic) {
      return left.id.localeCompare(right.id);
    }
    return left.topic.localeCompare(right.topic);
  });

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin">
        ← {copy.admin.cmsNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.quizNav}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.quizTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.quizSubtitle}</p>
      <p className="mt-3 inline-flex rounded-md bg-ink/5 px-3 py-2 text-xs font-bold uppercase text-ink/60">
        {copy.admin.catalogSource}: {quiz.source === "db" ? copy.admin.catalogDb : copy.admin.catalogFallback} ·{" "}
        {questions.length} {copy.admin.quizQuestionsCount}
      </p>

      <section className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{copy.admin.quizTopic}</th>
              <th className="px-4 py-3">{copy.admin.quizQuestionEn}</th>
              <th className="px-4 py-3">{copy.admin.editQuiz}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr className="border-t border-ink/10" key={question.id}>
                <td className="px-4 py-3 font-mono text-xs">{question.id}</td>
                <td className="px-4 py-3">{question.topic}</td>
                <td className="max-w-md px-4 py-3">
                  <span className="line-clamp-2">{question.question}</span>
                </td>
                <td className="px-4 py-3">
                  <Link className="font-bold text-violet hover:underline" href={`/admin/quiz/${question.id}`}>
                    {copy.admin.editQuiz}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
