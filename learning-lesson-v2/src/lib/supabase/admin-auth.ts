import { NextResponse } from "next/server";
import { isAdminEmailAllowed } from "./admin-allowlist";
import { createE2eUser, getE2eAuthState } from "./e2e-auth";
import { createClient } from "./server";

export async function requireAdminUser() {
  const e2e = await getE2eAuthState();
  if (e2e) {
    if (e2e.role !== "admin") {
      return { error: NextResponse.json({ error: "admin_required" }, { status: 403 }) };
    }

    return { supabase: await createClient(), user: createE2eUser(e2e.role) };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "not_authenticated" }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "admin_required" }, { status: 403 }) };
  }

  if (!isAdminEmailAllowed(profile.email ?? user.email)) {
    return { error: NextResponse.json({ error: "admin_allowlist" }, { status: 403 }) };
  }

  return { supabase, user };
}
