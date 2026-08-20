import { describe, expect, it } from "vitest";
import { isMentorOpenStatus, resolveMentorMode } from "./access";
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
      title: "Build a card component",
      brief: "HTML structure basics.",
      deliverable: "A semantic card",
      instructions: "Use semantic tags"
    });

    expect(messages.system).toContain("Never provide the final answer");
    expect(messages.system).toContain("exactly one small next step");
    expect(messages.system).toContain("untrusted data");
    expect(messages.system).toContain("Level 2");
    expect(messages.user).toContain("Assigned mission: Build a card component");
    expect(messages.user).toContain("Help mode: review");
    expect(messages.user).toContain("Learner draft so far");
    expect(messages.user).toContain("do not repeat them");
    expect(messages.user).not.toContain("official solution");
  });

  it("includes teacher feedback when the work was returned", () => {
    const messages = buildMentorMessages({
      language: "en",
      mode: "explain",
      level: 1,
      effort: "I put everything in one folder",
      title: "Bring order to your files",
      teacherNote: "Split documents and images into separate folders."
    });

    expect(messages.user).toContain("Teacher feedback to address");
    expect(messages.user).toContain("Split documents and images");
  });

  it("makes the third direction incomplete and non-runnable", () => {
    const messages = buildMentorMessages({
      language: "bg",
      mode: "explain",
      level: 3,
      effort: "<main>",
      title: "HTML",
      brief: "Основна структура.",
      deliverable: "Създай семантична карта."
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

  it("opens the mentor only while the assignment is still in progress", () => {
    expect(isMentorOpenStatus("missing")).toBe(true);
    expect(isMentorOpenStatus("draft")).toBe(true);
    expect(isMentorOpenStatus("needs_changes")).toBe(true);
    expect(isMentorOpenStatus("submitted")).toBe(false);
    expect(isMentorOpenStatus("approved")).toBe(false);
  });

  it("picks start, review, or explain from the draft and status", () => {
    expect(resolveMentorMode("missing", "")).toBe("start");
    expect(resolveMentorMode("draft", "plan")).toBe("review");
    expect(resolveMentorMode("needs_changes", "plan")).toBe("explain");
    expect(resolveMentorMode("needs_changes", "")).toBe("start");
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
