import { redirect } from "next/navigation";

type AdminQuizQuestionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminQuizQuestionPage({ params }: AdminQuizQuestionPageProps) {
  const { id } = await params;
  redirect(`/admin/knowledge-checks/${id}`);
}
