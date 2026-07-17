import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { toLessonRow, toMetadataRow } from "@/lib/cms/serialize";
import { validateLessonUpdate } from "@/lib/cms/validate";
import { readJsonObject } from "@/lib/http";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function revalidateLessonPaths(lessonId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/missions/${lessonId}`);
  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/paths");
  revalidatePath("/dashboard");
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
  const validation = validateLessonUpdate(await readJsonObject(request));
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const lessonRow = toLessonRow(validation.value);
  const metadataRow = toMetadataRow(id, validation.value);

  const { data: existingLesson, error: lookupError } = await auth
    .supabase!.from("lessons")
    .select("id, course_id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (!existingLesson) {
    return NextResponse.json({ error: "Unknown lesson." }, { status: 404 });
  }

  if (Object.keys(lessonRow).length > 1) {
    const { error } = await auth.supabase!.from("lessons").update(lessonRow).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (metadataRow) {
    const { error } = await auth.supabase!.from("lesson_metadata").upsert(metadataRow, { onConflict: "lesson_id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  revalidateLessonPaths(id);
  return NextResponse.json({ ok: true, lessonId: id, courseId: existingLesson.course_id });
}
