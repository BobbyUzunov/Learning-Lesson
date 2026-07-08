import { describe, expect, it, beforeEach } from "vitest";
import { buildMentorMessages } from "./prompt";
import { checkMentorRateLimit, resetMentorRateLimitForTests } from "./rate-limit";

describe("mentor", () => {
  beforeEach(() => {
    resetMentorRateLimitForTests();
  });

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

  it("enforces daily mentor rate limits per user", () => {
    const first = checkMentorRateLimit("user-1", 2);
    const second = checkMentorRateLimit("user-1", 2);
    const third = checkMentorRateLimit("user-1", 2);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
  });
});
