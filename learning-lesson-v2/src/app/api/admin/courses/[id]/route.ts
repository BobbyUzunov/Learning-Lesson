import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { toCourseRow } from "@/lib/cms/serialize";
import type { CourseUpdateInput } from "@/lib/cms/types";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function revalidateCoursePaths(courseId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/paths");
  revalidatePath("/dashboard");
  revalidatePath("/");
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
  const body = (await request.json()) as CourseUpdateInput;
  const row = toCourseRow(body);

  const { data, error } = await auth.supabase!.from("courses").update(row).eq("id", id).select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Unknown course." }, { status: 404 });
  }

  revalidateCoursePaths(id);
  return NextResponse.json({ ok: true, courseId: id });
}
