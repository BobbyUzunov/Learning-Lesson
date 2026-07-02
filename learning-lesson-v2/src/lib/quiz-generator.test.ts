import { describe, expect, it } from "vitest";
import { generateQuizQuestions, getQuizTopicForLesson, getQuestionBankSize } from "./quiz-generator";

describe("quiz-generator", () => {
  it("maps lessons to the expected quiz topics", () => {
    expect(getQuizTopicForLesson("14")).toBe("api");
    expect(getQuizTopicForLesson("24")).toBe("fullstack");
    expect(getQuizTopicForLesson("30")).toBe("ai");
    expect(getQuizTopicForLesson("36")).toBe("mobile");
    expect(getQuizTopicForLesson("42")).toBe("product");
  });

  it("returns the requested number of questions when the bank is large enough", () => {
    const questions = generateQuizQuestions("api", 3);
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.topic === "api" || question.topic === "html")).toBe(true);
  });

  it("exposes non-empty banks for new quest topics", () => {
    expect(getQuestionBankSize("fullstack")).toBeGreaterThan(0);
    expect(getQuestionBankSize("ai")).toBeGreaterThan(0);
    expect(getQuestionBankSize("mobile")).toBeGreaterThan(0);
    expect(getQuestionBankSize("product")).toBeGreaterThan(0);
  });
});
