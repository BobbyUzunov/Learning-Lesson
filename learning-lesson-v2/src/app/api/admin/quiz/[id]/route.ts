import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { toQuizQuestionRow } from "@/lib/cms/serialize";
import type { QuizUpdateInput } from "@/lib/cms/types";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function revalidateQuizPaths(questionId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/quiz");
  revalidatePath(`/admin/quiz/${questionId}`);
  revalidatePath("/lesson", "layout");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = (await request.json()) as QuizUpdateInput;
  const row = toQuizQuestionRow(body);

  const { data, error } = await auth.supabase!.from("quiz_questions").update(row).eq("id", id).select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Unknown quiz question." }, { status: 404 });
  }

  revalidateQuizPaths(id);
  return NextResponse.json({ ok: true, questionId: id });
}
