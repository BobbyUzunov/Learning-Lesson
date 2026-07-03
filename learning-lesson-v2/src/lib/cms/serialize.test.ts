import { describe, expect, it } from "vitest";
import { arrayToLines, linesToArray, parseChecklistJson, toCourseRow, toLessonRow, toMetadataRow, toProjectRow, toQuizQuestionRow } from "./serialize";

describe("cms serialize", () => {
  it("converts multiline text to arrays", () => {
    expect(linesToArray("One\nTwo\n\nThree")).toEqual(["One", "Two", "Three"]);
    expect(arrayToLines(["One", "Two"])).toBe("One\nTwo");
  });

  it("maps course input to database columns", () => {
    expect(toCourseRow({ title: "Frontend", titleBg: "Frontend BG", xpReward: 800 })).toMatchObject({
      title: "Frontend",
      title_bg: "Frontend BG",
      xp_reward: 800
    });
  });

  it("maps lesson and metadata input to database columns", () => {
    expect(toLessonRow({ title: "Lesson 1", mission: "Build HTML" })).toMatchObject({
      title: "Lesson 1",
      mission: "Build HTML"
    });

    expect(
      toMetadataRow("1", {
        learningObjectives: ["Goal 1"],
        readingTimeMinutes: 10
      })
    ).toMatchObject({
      lesson_id: "1",
      learning_objectives: ["Goal 1"],
      reading_time_minutes: 10
    });
  });

  it("maps project and quiz input to database columns", () => {
    expect(toProjectRow({ briefMinLength: 120, requiresRepo: true })).toMatchObject({
      brief_min_length: 120,
      requires_repo: true
    });

    expect(toQuizQuestionRow({ correctIndex: 2, topic: "html" })).toMatchObject({
      correct_index: 2,
      topic: "html"
    });
  });

  it("parses checklist JSON", () => {
    expect(parseChecklistJson('[{"id":"repo","label":"Repo URL","labelBg":"Репо"}]')).toEqual([
      { id: "repo", label: "Repo URL", labelBg: "Репо" }
    ]);
  });
});
