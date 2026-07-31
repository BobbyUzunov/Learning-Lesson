import { redirect } from "next/navigation";

export default async function AdminQuizPage() {
  redirect("/admin/knowledge-checks");
}
