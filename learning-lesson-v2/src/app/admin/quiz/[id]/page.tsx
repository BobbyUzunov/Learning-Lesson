import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminQuizEditor } from "@/components/admin-quiz-editor";
import { getQuizContent } from "@/lib/quiz";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

type AdminQuizQuestionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminQuizQuestionPage({ params }: AdminQuizQuestionPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const quiz = await getQuizContent();
  const question = quiz.questions.find((item) => item.id === id);

  if (!question) {
    notFound();
  }

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin/quiz">
        ← {copy.admin.quizNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.editQuiz}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{question.id}</h1>
      <p className="mt-2 text-sm text-ink/70">
        {copy.admin.quizTopic}: {question.topic}
      </p>
      <AdminQuizEditor language={language} question={question} />
    </div>
  );
}
