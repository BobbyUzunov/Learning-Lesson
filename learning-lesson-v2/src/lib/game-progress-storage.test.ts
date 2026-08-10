import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeStoredLesson,
  gameProgressStorageKey,
  getStoredProgress
} from "./game-progress-storage";

function createLocalStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear()
  };
}

describe("game progress storage", () => {
  const localStorage = createLocalStorage();

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("window", { localStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back safely for malformed JSON", () => {
    localStorage.setItem(gameProgressStorageKey, "{not-json");

    expect(getStoredProgress()).toEqual({
      completedLessonIds: [],
      currentStreak: 0,
      lastCompletedAt: null
    });
  });

  it("normalizes client-controlled fields and removes invalid lesson ids", () => {
    localStorage.setItem(
      gameProgressStorageKey,
      JSON.stringify({
        completedLessonIds: ["1", " 1 ", "", 2, "x".repeat(101), "2"],
        currentStreak: -20,
        lastCompletedAt: "not-a-date"
      })
    );

    expect(getStoredProgress()).toEqual({
      completedLessonIds: ["1", "2"],
      currentStreak: 0,
      lastCompletedAt: null
    });
  });

  it("can complete a lesson after recovering from an invalid stored shape", () => {
    localStorage.setItem(gameProgressStorageKey, JSON.stringify({ completedLessonIds: null }));

    const progress = completeStoredLesson("1");

    expect(progress.completedLessonIds).toEqual(["1"]);
    expect(getStoredProgress().completedLessonIds).toEqual(["1"]);
  });
});
