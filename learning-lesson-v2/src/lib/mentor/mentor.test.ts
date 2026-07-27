import { describe, expect, it } from "vitest";
import { buildMentorMessages, isMentorHintLevel, isMentorMode } from "./prompt";
import { parseMentorDailyLimit, computeMentorRemaining, isMentorLimitReached } from "./usage";

describe("mentor", () => {
  it("builds a guarded Socratic prompt without solution leakage intent", () => {
    const messages = buildMentorMessages({
      language: "en",
      mode: "review",
      level: 2,
      effort: "I wrote a header tag",
      previousHints: ["Which semantic element could contain the card?"],
      lesson: {
        title: "Lesson 1",
        explanation: "HTML structure basics.",
        mission: "Build a card component.",
        learningObjectives: ["Use semantic tags"],
        keyConcepts: ["HTML", "structure"]
      }
    });

    expect(messages.system).toContain("Never provide the final answer");
    expect(messages.system).toContain("exactly one small next step");
    expect(messages.system).toContain("untrusted data");
    expect(messages.system).toContain("Level 2");
    expect(messages.user).toContain("Help mode: review");
    expect(messages.user).toContain("Learner draft so far");
    expect(messages.user).toContain("do not repeat them");
    expect(messages.user).not.toContain("official solution");
  });

  it("makes the third direction incomplete and non-runnable", () => {
    const messages = buildMentorMessages({
      language: "bg",
      mode: "explain",
      level: 3,
      effort: "<main>",
      lesson: {
        title: "HTML",
        explanation: "Основна структура.",
        mission: "Създай семантична карта.",
        learningObjectives: [],
        keyConcepts: []
      }
    });

    expect(messages.system).toContain("at most 4 incomplete lines");
    expect(messages.system).toContain("must not be a complete or directly runnable solution");
    expect(messages.system).toContain("Bulgarian");
  });

  it("validates mentor modes and direction levels", () => {
    expect(isMentorMode("start")).toBe(true);
    expect(isMentorMode("answer")).toBe(false);
    expect(isMentorHintLevel(1)).toBe(true);
    expect(isMentorHintLevel(3)).toBe(true);
    expect(isMentorHintLevel(4)).toBe(false);
  });

  it("computes mentor quota helpers", () => {
    expect(computeMentorRemaining(0, 5)).toBe(5);
    expect(computeMentorRemaining(4, 5)).toBe(1);
    expect(computeMentorRemaining(5, 5)).toBe(0);
    expect(isMentorLimitReached(4, 5)).toBe(false);
    expect(isMentorLimitReached(5, 5)).toBe(true);
  });

  it("falls back to a safe daily limit when env is invalid", () => {
    expect(parseMentorDailyLimit(undefined)).toBe(5);
    expect(parseMentorDailyLimit("0")).toBe(5);
    expect(parseMentorDailyLimit("abc")).toBe(5);
    expect(parseMentorDailyLimit("7")).toBe(7);
  });
});
