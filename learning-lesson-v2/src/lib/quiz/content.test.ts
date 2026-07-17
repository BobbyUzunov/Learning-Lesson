import { describe, expect, it } from "vitest";
import {
  createSeededRandom,
  generateQuizQuestions,
  getFallbackQuizContent,
  getQuestionBankSize,
  getQuizTopicForLesson
} from "./index";

describe("quiz content", () => {
  const content = getFallbackQuizContent();

  it("maps lessons to the expected quiz topics", () => {
    expect(getQuizTopicForLesson(content, "14")).toBe("api");
    expect(getQuizTopicForLesson(content, "24")).toBe("fullstack");
    expect(getQuizTopicForLesson(content, "30")).toBe("ai");
    expect(getQuizTopicForLesson(content, "36")).toBe("mobile");
    expect(getQuizTopicForLesson(content, "42")).toBe("product");
  });

  it("returns the requested number of questions when the bank is large enough", () => {
    const questions = generateQuizQuestions(content, "api", 3);
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.topic === "api" || question.topic === "html")).toBe(true);
  });

  it("produces stable question sets for a seeded lesson attempt", () => {
    const first = generateQuizQuestions(content, "api", 3, createSeededRandom("14:0"));
    const second = generateQuizQuestions(content, "api", 3, createSeededRandom("14:0"));
    expect(second.map((question) => question.id)).toEqual(first.map((question) => question.id));
  });

  it("exposes non-empty banks for new quest topics", () => {
    expect(getQuestionBankSize(content, "fullstack")).toBeGreaterThan(0);
    expect(getQuestionBankSize(content, "ai")).toBeGreaterThan(0);
    expect(getQuestionBankSize(content, "mobile")).toBeGreaterThan(0);
    expect(getQuestionBankSize(content, "product")).toBeGreaterThan(0);
  });
});
