import type { ReactNode } from "react";

export function LessonSection({
  children,
  number,
  title
}: {
  children: ReactNode;
  number: number;
  title: string;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 border-b border-ink/10 pb-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-violet/15 text-sm font-black text-violet">
          {number}
        </span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
