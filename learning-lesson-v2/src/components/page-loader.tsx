import { Loader2 } from "lucide-react";

export function PageLoader({ label }: { label: string }) {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-6xl flex-col items-center justify-center gap-3 px-4 py-16">
      <Loader2 aria-hidden className="size-8 animate-spin text-violet" />
      <p className="text-sm font-bold text-ink/70">{label}</p>
    </div>
  );
}
