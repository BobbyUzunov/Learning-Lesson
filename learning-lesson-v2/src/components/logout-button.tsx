"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
      onClick={logout}
      type="button"
    >
      <LogOut className="size-4" />
      {label}
    </button>
  );
}
