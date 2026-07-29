import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateAssessmentForm } from "@/components/teacher/create-assessment-form";
import {
  getAssessmentTemplatesForClassroom,
  localizeAssessmentTemplate
} from "@/lib/assessments/templates";
import { t } from "@/lib/i18n";
import { getLanguage } from "@/lib/i18n-server";
import { getClassroomById } from "@/lib/supabase/classrooms";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const language = await getLanguage();
  const copy = t(language).assessment;
  const { id } = await params;
  const classroom = await getClassroomById(id);

  if (!classroom || classroom.status !== "active") {
    notFound();
  }

  const templates = getAssessmentTemplatesForClassroom(
    classroom.specialtyId,
    classroom.gradeLevel
  ).map((template) => localizeAssessmentTemplate(template, language));

  return (
    <div className="max-w-4xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
        href={`/teacher/classes/${id}/assessments`}
      >
        <ArrowLeft className="size-4" />
        {copy.backToAssessments}
      </Link>
      <p className="mt-6 text-sm font-bold uppercase text-violet">{classroom.name}</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">{copy.createTitle}</h1>
      <p className="mt-3 max-w-2xl text-ink/65">{copy.createSubtitle}</p>
      <div className="mt-8">
        <CreateAssessmentForm classroomId={id} language={language} templates={templates} />
      </div>
    </div>
  );
}
