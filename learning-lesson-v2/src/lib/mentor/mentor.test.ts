import { describe, expect, it } from "vitest";
import { buildMentorMessages } from "./prompt";
import { parseMentorDailyLimit, computeMentorRemaining, isMentorLimitReached } from "./usage";

describe("mentor", () => {
  it("builds guarded mentor prompts without solution leakage intent", () => {
    const messages = buildMentorMessages({
      language: "en",
      question: "How do I start?",
      effort: "I wrote a header tag",
      lesson: {
        title: "Lesson 1",
        explanation: "HTML structure basics.",
        mission: "Build a card component.",
        learningObjectives: ["Use semantic tags"],
        keyConcepts: ["HTML", "structure"]
      }
    });

    expect(messages.system).toContain("never the full solution");
    expect(messages.user).toContain("Learner question: How do I start?");
    expect(messages.user).not.toContain("solution");
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
