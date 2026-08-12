import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject, resolvePublicErrorCode } from "@/lib/http";
import { requireTeacherUser } from "@/lib/supabase/teacher-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type EnableRow = {
  id: string;
  join_code_enabled: boolean;
};

const setJoinCodeEnabledErrors = ["not_authenticated", "not_authorized", "classroom_archived"] as const;

function setJoinCodeEnabledErrorStatus(code: string) {
  if (code === "not_authenticated") return 401;
  if (code === "not_authorized") return 403;
  if (code === "join_code_update_failed") return 500;
  return 400;
}

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
    const code = resolvePublicErrorCode(error.message, setJoinCodeEnabledErrors, "join_code_update_failed");
    return NextResponse.json({ error: code }, { status: setJoinCodeEnabledErrorStatus(code) });
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${id}`);

  return NextResponse.json({
    ok: true,
    classroom: { id: data.id, joinCodeEnabled: data.join_code_enabled }
  });
}
