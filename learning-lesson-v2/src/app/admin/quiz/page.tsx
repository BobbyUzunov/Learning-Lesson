/** @deprecated Use `/admin/knowledge-checks`. Compatibility redirect for old bookmarks. */
import { redirect } from "next/navigation";

export default async function AdminQuizPage() {
  redirect("/admin/knowledge-checks");
}
