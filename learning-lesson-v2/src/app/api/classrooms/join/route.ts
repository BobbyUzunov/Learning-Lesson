import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type JoinClassroomRow = {
  classroom_id: string;
  name: string;
};

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const body = await readJsonObject(request);
  const joinCode = typeof body?.joinCode === "string" ? body.joinCode.trim().toUpperCase() : "";

  if (!/^[A-Z0-9]{6}$/.test(joinCode)) {
    return NextResponse.json({ error: "invalid_join_code" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: authData
  } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .rpc("join_classroom", { p_join_code: joinCode })
    .single<JoinClassroomRow>();

  if (error) {
    const status = error.message.includes("classroom_not_found") ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  revalidatePath("/classes");

  return NextResponse.json({
    ok: true,
    classroom: { id: data.classroom_id, name: data.name }
  });
}
