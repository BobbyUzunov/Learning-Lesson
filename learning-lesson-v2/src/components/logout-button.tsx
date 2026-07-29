import { LogOut } from "lucide-react";

export function LogoutButton({ className = "", label }: { className?: string; label: string }) {
  return (
    <form action="/auth/logout" method="post">
      <button
        className={`focus-ring inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink ${className}`}
        type="submit"
      >
        <LogOut className="size-4" />
        {label}
      </button>
    </form>
  );
}
