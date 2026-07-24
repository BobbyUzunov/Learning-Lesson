import { NextResponse } from "next/server";
import { createClient } from "./server";

export async function requireTeacherUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Teacher access required." }, { status: 403 }) };
  }

  return { supabase, user };
}
