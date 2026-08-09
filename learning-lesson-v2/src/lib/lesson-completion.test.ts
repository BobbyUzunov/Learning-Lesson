import { describe, expect, it } from "vitest";
import { canCompleteLessonMission } from "./lesson-completion";

describe("canCompleteLessonMission", () => {
  it("requires effort or all hints before the knowledge check gate", () => {
    expect(
      canCompleteLessonMission({
        effortChars: 4,
        minEffortChars: 12,
        hintsUsed: 0,
        hintCount: 3,
        knowledgeCheckPassed: true
      })
    ).toEqual({ ok: false, reason: "effort" });

    expect(
      canCompleteLessonMission({
        effortChars: 4,
        minEffortChars: 12,
        hintsUsed: 3,
        hintCount: 3,
        knowledgeCheckPassed: true
      }).ok
    ).toBe(true);
  });

  it("requires a passed knowledge check even when effort is enough", () => {
    expect(
      canCompleteLessonMission({
        effortChars: 20,
        minEffortChars: 12,
        hintsUsed: 0,
        hintCount: 3,
        knowledgeCheckPassed: false
      })
    ).toEqual({ ok: false, reason: "knowledge_check" });
  });

  it("passes when effort and knowledge check are satisfied", () => {
    expect(
      canCompleteLessonMission({
        effortChars: 20,
        minEffortChars: 12,
        hintsUsed: 1,
        hintCount: 3,
        knowledgeCheckPassed: true
      })
    ).toEqual({ ok: true });
  });
});
