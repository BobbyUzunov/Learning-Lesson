import { LogOut } from "lucide-react";

export function LogoutButton({ className = "", label }: { className?: string; label: string }) {
  return (
    <form action="/auth/logout" method="post">
      <button
        className={`focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/10 bg-white/70 px-3 text-sm font-semibold text-ink/65 transition hover:border-ink/20 hover:bg-white hover:text-ink ${className}`}
        type="submit"
      >
        <LogOut className="size-3.5 shrink-0" />
        <span>{label}</span>
      </button>
    </form>
  );
}
