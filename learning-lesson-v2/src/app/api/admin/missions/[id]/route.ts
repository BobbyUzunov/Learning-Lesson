import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { toLessonRow } from "@/lib/cms/serialize";
import type { LessonUpdateInput } from "@/lib/cms/types";
import { getLessonFromCatalog } from "@/lib/catalog/helpers";
import { getCourseCatalog } from "@/lib/catalog";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const catalog = await getCourseCatalog();
  const lesson = getLessonFromCatalog(catalog, id);
  if (!lesson) {
    return NextResponse.json({ error: "Unknown mission." }, { status: 404 });
  }

  const body = (await request.json()) as LessonUpdateInput;
  const lessonRow = toLessonRow(body);

  const { data: existingLesson, error: lookupError } = await auth
    .supabase!.from("lessons")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (existingLesson) {
    const { error } = await auth.supabase!.from("lessons").update(lessonRow).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const row = {
      id,
      course_id: lesson.questId,
      sort_order: Math.max(catalog.courses.find((course) => course.id === lesson.questId)?.lessonIds.indexOf(id) ?? 0, 0),
      title: body.title ?? lesson.title,
      title_bg: body.titleBg ?? lesson.titleBg ?? null,
      explanation: body.explanation ?? lesson.explanation,
      explanation_bg: body.explanationBg ?? lesson.explanationBg ?? null,
      code_example: body.codeExample ?? lesson.codeExample,
      mission: body.mission ?? lesson.mission,
      mission_bg: body.missionBg ?? lesson.missionBg ?? null,
      solution: body.solution ?? lesson.solution,
      hint1: body.hint1 ?? lesson.hint1 ?? lesson.hint ?? null,
      hint1_bg: body.hint1Bg ?? lesson.hint1Bg ?? lesson.hintBg ?? null,
      hint2: body.hint2 ?? lesson.hint2 ?? null,
      hint2_bg: body.hint2Bg ?? lesson.hint2Bg ?? null,
      hint3: body.hint3 ?? lesson.hint3 ?? null,
      hint3_bg: body.hint3Bg ?? lesson.hint3Bg ?? null,
      updated_at: new Date().toISOString()
    };

    const { error } = await auth.supabase!.from("lessons").upsert(row, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  revalidatePath(`/lesson/${id}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/missions/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/paths");

  return NextResponse.json({ ok: true, lessonId: id });
}
