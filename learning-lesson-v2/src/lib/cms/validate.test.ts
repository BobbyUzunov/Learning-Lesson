import { describe, expect, it } from "vitest";
import {
  validateCourseUpdate,
  validateKnowledgeCheckUpdate,
  validateLessonUpdate,
  validateProjectUpdate
} from "./validate";

describe("CMS update validation", () => {
  it("accepts valid partial updates", () => {
    expect(validateCourseUpdate({ title: "Frontend", xpReward: 100 }).ok).toBe(true);
    expect(validateLessonUpdate({ title: "HTML", readingTimeMinutes: 12 }).ok).toBe(true);
    expect(validateProjectUpdate({ type: "capstone", briefMinLength: 100 }).ok).toBe(true);
    expect(validateKnowledgeCheckUpdate({ options: ["A", "B"], correctIndex: 1 }).ok).toBe(true);
    expect(validateKnowledgeCheckUpdate({ topic: "html" }).ok).toBe(true);
  });

  it("rejects unknown, malformed, or oversized fields", () => {
    expect(validateCourseUpdate({ role: "admin" })).toEqual({ ok: false, error: "invalid_role" });
    expect(validateLessonUpdate({ learningObjectives: "not-an-array" }).ok).toBe(false);
    expect(validateProjectUpdate({ briefMinLength: 0 }).ok).toBe(false);
    expect(validateKnowledgeCheckUpdate({ correctIndex: 99 }).ok).toBe(false);
    expect(validateKnowledgeCheckUpdate({ topic: "not-a-topic" })).toEqual({
      ok: false,
      error: "invalid_topic"
    });
  });

  it("requires bilingual option arrays to match and bounds correctIndex", () => {
    expect(
      validateKnowledgeCheckUpdate({
        options: ["A", "B", "C"],
        optionsBg: ["А", "Б"],
        correctIndex: 1
      })
    ).toEqual({ ok: false, error: "invalid_options_mismatch" });

    expect(
      validateKnowledgeCheckUpdate({
        options: ["A", "B"],
        optionsBg: ["А", "Б"],
        correctIndex: 2
      })
    ).toEqual({ ok: false, error: "invalid_correctIndex" });

    expect(
      validateKnowledgeCheckUpdate({
        options: ["A", "B"],
        optionsBg: ["А", "Б"],
        correctIndex: 1
      }).ok
    ).toBe(true);
  });

  it("rejects empty and non-object payloads", () => {
    expect(validateCourseUpdate({}).ok).toBe(false);
    expect(validateCourseUpdate(null).ok).toBe(false);
  });
});
