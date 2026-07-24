import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type JoinClassroomRow = {
  classroom_id: string;
  name: string;
};

function joinErrorStatus(message: string) {
  if (message.includes("join_rate_limited")) {
    return 429;
  }
  if (message.includes("classroom_not_found")) {
    return 404;
  }
  if (message.includes("classroom_unavailable") || message.includes("teacher_cannot_join")) {
    return 403;
  }
  return 400;
}

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
    return NextResponse.json({ error: error.message }, { status: joinErrorStatus(error.message) });
  }

  revalidatePath("/classes");

  return NextResponse.json({
    ok: true,
    classroom: { id: data.classroom_id, name: data.name }
  });
}
