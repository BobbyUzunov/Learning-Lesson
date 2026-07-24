import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readJsonObject } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SubmitRow = {
  id: string;
  assignment_id: string;
  status: string;
  submitted_at: string;
};

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: assignmentId } = await context.params;
  const body = await readJsonObject(request);
  const deliverableText = typeof body?.deliverableText === "string" ? body.deliverableText.trim() : "";
  const deliverableUrl = typeof body?.deliverableUrl === "string" ? body.deliverableUrl.trim() : "";

  if (!deliverableText && !deliverableUrl) {
    return NextResponse.json({ error: "deliverable_required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .rpc("submit_assignment", {
      p_assignment_id: assignmentId,
      p_deliverable_text: deliverableText,
      p_deliverable_url: deliverableUrl
    })
    .single<SubmitRow>();

  if (error) {
    const status = error.message.includes("not_authorized")
      ? 403
      : error.message.includes("assignment_not_found")
        ? 404
        : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/classes");
  revalidatePath("/dashboard");
  revalidatePath("/teacher");

  return NextResponse.json({
    ok: true,
    submission: {
      id: data.id,
      assignmentId: data.assignment_id,
      status: data.status,
      submittedAt: data.submitted_at
    }
  });
}
