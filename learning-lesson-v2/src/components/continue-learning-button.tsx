"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getStoredProgress, getGameProgressStats } from "@/lib/game-progress";

type ContinueLearningButtonProps = {
  className?: string;
  label?: string;
};

export function ContinueLearningButton({ className, label = "Continue Learning" }: ContinueLearningButtonProps) {
  const [href, setHref] = useState("/lesson/1");

  useEffect(() => {
    const progress = getStoredProgress();
    const stats = getGameProgressStats(progress);
    setHref(`/lesson/${stats.currentMission.id}`);
  }, []);

  return (
    <Link
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-md bg-mint px-5 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-mint/80"
      }
      href={href}
    >
      {label}
      <ArrowRight className="size-5" />
    </Link>
  );
}
