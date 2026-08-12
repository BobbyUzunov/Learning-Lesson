import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
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

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-coral">{copy.nav.roleAdmin}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {copy.admin.knowledgeCheckTitle}
      </h1>
      <p className="mt-3 max-w-2xl text-ink/60">{copy.admin.knowledgeCheckSubtitle}</p>
      <p className="mt-2 text-xs font-bold text-ink/40">
        {questions.length} {copy.admin.knowledgeCheckQuestionsCount}
      </p>

      {questions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white/60 px-4 py-8 text-center">
          <ClipboardCheck className="mx-auto size-8 text-ink/30" />
          <p className="mt-3 text-sm font-semibold text-ink/50">{copy.admin.knowledgeCheckTitle}</p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/75">
          {questions.map((question, index) => (
            <li
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                index > 0 ? "border-t border-ink/8" : ""
              }`}
              key={question.id}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">
                  {getKnowledgeCheckTopicLabel(question.topic, language)}
                </p>
                <p className="mt-1 line-clamp-2 font-semibold text-ink/85">
                  {language === "bg" ? question.questionBg : question.question}
                </p>
              </div>
              <Link
                className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-paper"
                href={`/admin/knowledge-checks/${question.id}`}
              >
                {copy.admin.editKnowledgeCheck}
                <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
