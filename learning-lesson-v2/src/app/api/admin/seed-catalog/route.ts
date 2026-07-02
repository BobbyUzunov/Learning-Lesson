import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { seedCatalogToDatabase } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { supabase, user };
}

export async function POST() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  try {
    const result = await seedCatalogToDatabase();
    revalidatePath("/");
    revalidatePath("/paths");
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
