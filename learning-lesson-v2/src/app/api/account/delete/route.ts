import { NextResponse } from "next/server";
import { getUserDeletionBlockReason } from "@/lib/admin/user-deletion";
import { readJsonObject } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin-env";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  const body = await readJsonObject(request);
  if (body?.confirm !== true) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "account_delete_unavailable" }, { status: 503 });
  }

  const blockReason = await getUserDeletionBlockReason(supabase, user.id, {
    actorUserId: user.id,
    role: profile?.role,
    allowSelf: true
  });

  if (blockReason) {
    return NextResponse.json({ error: blockReason }, { status: 403 });
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) {
    logServerError("account_delete_failed", { userId: user.id, detail: error.message.slice(0, 200) });
    return NextResponse.json({ error: "account_delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
