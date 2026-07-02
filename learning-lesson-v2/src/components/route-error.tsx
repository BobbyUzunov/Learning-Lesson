"use client";

import { useEffect } from "react";
import Link from "next/link";

export function RouteError({
  title,
  message,
  tryAgainLabel,
  homeLabel,
  reset
}: {
  title: string;
  message: string;
  tryAgainLabel: string;
  homeLabel: string;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(message);
  }, [message]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">{message}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-bold text-paper"
          onClick={reset}
          type="button"
        >
          {tryAgainLabel}
        </button>
        <Link className="focus-ring rounded-md border border-ink/15 px-4 py-3 text-sm font-bold" href="/">
          {homeLabel}
        </Link>
      </div>
    </main>
  );
}
