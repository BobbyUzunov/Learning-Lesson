import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { seedAllContentToDatabase } from "@/lib/catalog";
import { requireAdminUser } from "@/lib/supabase/admin-auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  }

  const auth = await requireAdminUser();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  try {
    const result = await seedAllContentToDatabase();
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
