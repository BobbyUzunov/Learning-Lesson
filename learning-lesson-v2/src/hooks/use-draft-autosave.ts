"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { clearJsonDraft, readJsonDraft, writeJsonDraft } from "@/lib/draft-storage";

export type DraftStatus = "idle" | "restored" | "saved";

function resolveNextValue<T>(current: T, next: SetStateAction<T>) {
  return typeof next === "function" ? (next as (value: T) => T)(current) : next;
}

export function useDraftAutosave<T>({
  key,
  initialValue,
  enabled = true,
  debounceMs = 500
}: {
  key: string;
  initialValue: T;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const [value, setValueState] = useState<T>(initialValue);
  const [status, setStatus] = useState<DraftStatus>("idle");
  const hydratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  const setValue: Dispatch<SetStateAction<T>> = (next) => {
    setValueState((current) => resolveNextValue(current, next));
  };

  useEffect(() => {
    if (!enabled || hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;
    const restored = readJsonDraft<T>(key);
    if (restored !== null) {
      skipNextSaveRef.current = true;
      setValueState(restored);
      setStatus("restored");
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || !hydratedRef.current) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      writeJsonDraft(key, value);
      setStatus("saved");
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, key, value]);

  function clearDraft() {
    clearJsonDraft(key);
    setStatus("idle");
  }

  return { value, setValue, status, clearDraft };
}
