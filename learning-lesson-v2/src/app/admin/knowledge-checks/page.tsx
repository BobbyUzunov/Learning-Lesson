import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getAdminKnowledgeCheckContent } from "@/lib/knowledge-check";
import { getKnowledgeCheckTopicLabel } from "@/lib/knowledge-check/helpers";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgeChecksPage() {
  const language = await getLanguage();
  const copy = t(language);
  const content = await getAdminKnowledgeCheckContent();
  const questions = content.questions.slice().sort((left, right) => {
    if (left.topic === right.topic) {
      return left.id.localeCompare(right.id);
    }
    return left.topic.localeCompare(right.topic);
  });
  const sourceLabel = {
    db: copy.admin.catalogDb,
    fallback: copy.admin.catalogFallback,
    unavailable: copy.admin.catalogUnavailable
  }[content.source];

  return (
    <div>
      <Link className="text-sm font-bold text-ink/70 hover:text-ink" href="/admin">
        ← {copy.admin.cmsNav}
      </Link>
      <p className="mt-4 text-sm font-bold uppercase text-coral">{copy.admin.knowledgeCheckNav}</p>
      <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{copy.admin.knowledgeCheckTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/70">{copy.admin.knowledgeCheckSubtitle}</p>
      <p className="mt-3 inline-flex rounded-md bg-ink/5 px-3 py-2 text-xs font-bold uppercase text-ink/60">
        {copy.admin.catalogSource}: {sourceLabel} ·{" "}
        {questions.length} {copy.admin.knowledgeCheckQuestionsCount}
      </p>

      <section className="mt-6 overflow-x-auto rounded-lg border border-ink/10 bg-white/80">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="px-4 py-3">{copy.admin.knowledgeCheckTopic}</th>
              <th className="px-4 py-3">
                {language === "bg" ? copy.admin.knowledgeCheckQuestionBg : copy.admin.knowledgeCheckQuestionEn}
              </th>
              <th className="px-4 py-3">{copy.admin.editKnowledgeCheck}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr className="border-t border-ink/10" key={question.id}>
                <td className="px-4 py-3">{getKnowledgeCheckTopicLabel(question.topic, language)}</td>
                <td className="max-w-md px-4 py-3">
                  <span className="line-clamp-2">
                    {language === "bg" ? question.questionBg : question.question}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="font-bold text-violet hover:underline"
                    href={`/admin/knowledge-checks/${question.id}`}
                  >
                    {copy.admin.editKnowledgeCheck}
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
