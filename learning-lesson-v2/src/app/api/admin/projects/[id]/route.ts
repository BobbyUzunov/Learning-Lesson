import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { toProjectRow } from "@/lib/cms/serialize";
import { validateProjectUpdate } from "@/lib/cms/validate";
import { readJsonObject } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function revalidateProjectPaths(projectId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/paths");
  revalidatePath(`/projects/${projectId}`);
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
  const validation = validateProjectUpdate(await readJsonObject(request));
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const row = toProjectRow(validation.value);

  const { data, error } = await auth.supabase!.from("course_projects").update(row).eq("id", id).select("id").maybeSingle();

  if (error) {
    logServerError("admin_project_update_failed", {
      projectId: id,
      detail: error.message.slice(0, 200)
    });
    return NextResponse.json({ error: "project_update_failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Unknown project." }, { status: 404 });
  }

  revalidateProjectPaths(id);
  return NextResponse.json({ ok: true, projectId: id });
}
