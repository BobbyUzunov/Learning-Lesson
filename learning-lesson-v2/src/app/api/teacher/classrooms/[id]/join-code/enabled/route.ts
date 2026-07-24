import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type EnableRow = {
  id: string;
  join_code_enabled: boolean;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireTeacherUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = await readJsonObject(request);
  const enabled = typeof body?.enabled === "boolean" ? body.enabled : null;

  if (enabled === null) {
    return NextResponse.json({ error: "invalid_enabled" }, { status: 400 });
  }

  const { data, error } = await auth
    .supabase!.rpc("set_classroom_join_code_enabled", {
      p_classroom_id: id,
      p_enabled: enabled
    })
    .single<EnableRow>();

  if (error) {
    const statusCode = error.message.includes("not_authorized") ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  revalidatePath("/teacher");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, joinCodeEnabled: data.join_code_enabled }
  });
}
