import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminKnowledgeCheckEditor } from "@/components/admin-knowledge-check-editor";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getKnowledgeCheckContent } from "@/lib/knowledge-check";
import { getKnowledgeCheckTopicLabel } from "@/lib/knowledge-check/helpers";

export const dynamic = "force-dynamic";

type AdminKnowledgeCheckQuestionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminKnowledgeCheckQuestionPage({
  params
}: AdminKnowledgeCheckQuestionPageProps) {
  const language = await getLanguage();
  const copy = t(language);
  const { id } = await params;
  const content = await getKnowledgeCheckContent();
  const question = content.questions.find((item) => item.id === id);

  if (!question) {
    notFound();
  }

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin/knowledge-checks">
        ← {copy.admin.knowledgeCheckNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.editKnowledgeCheck}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">
        {language === "bg" ? question.questionBg : question.question}
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        {copy.admin.knowledgeCheckTopic}: {getKnowledgeCheckTopicLabel(question.topic, language)}
      </p>
      <AdminKnowledgeCheckEditor language={language} question={question} />
    </div>
  );
}
