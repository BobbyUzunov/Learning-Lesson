import { test, expect } from "@playwright/test";
import { openLessonTask } from "./helpers/lesson";
import {
  fallbackKnowledgeCheckBank,
  fallbackLessonKnowledgeCheckMap
} from "../src/lib/knowledge-check/fallback-data";
import {
  createSeededRandom,
  generateKnowledgeCheckQuestions,
  getKnowledgeCheckTopicForLesson
} from "../src/lib/knowledge-check/helpers";
import type { KnowledgeCheckContent } from "../src/lib/knowledge-check/types";

const fallbackKnowledgeCheckContent: KnowledgeCheckContent = {
  questions: fallbackKnowledgeCheckBank,
  lessonTopics: fallbackLessonKnowledgeCheckMap,
  source: "fallback"
};

test("guest can open the first free lesson", async ({ page }) => {
  await page.goto("/lesson/1");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#lesson-solution")).toHaveCount(0);
  await openLessonTask(page);
});

test("guest cannot open locked lessons", async ({ page }) => {
  await page.goto("/lesson/2", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/courses\?guestLocked=1/, { timeout: 15_000 });
});

test("guest completes the first lesson and sees signup prompt", async ({ page }) => {
  await page.goto("/lesson/1");

  await openLessonTask(page);
  await page.locator("#lesson-solution").fill("Built a semantic HTML page with header, main, and footer sections.");
  await page.getByRole("button", { name: /check my attempt|провери опита/i }).click();
  await expect(page.getByText(/knowledge check|самопроверка/i).first()).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText(/\bquiz\b|quiz-ът|куиз/i);
  const knowledgeCheckQuestions = page.locator("article article");
  const expectedQuestions = generateKnowledgeCheckQuestions(
    fallbackKnowledgeCheckContent,
    getKnowledgeCheckTopicForLesson(fallbackKnowledgeCheckContent, "1")!,
    3,
    createSeededRandom("1:0")
  );
  await expect(knowledgeCheckQuestions).toHaveCount(expectedQuestions.length);
  for (const [index, question] of expectedQuestions.entries()) {
    await knowledgeCheckQuestions.nth(index).getByRole("radio").nth(question.correctIndex!).click();
  }
  await page.getByRole("button", { name: /check answers|провери отговорите/i }).click();
  await expect(page.getByText(/passed|успешно/i)).toBeVisible();
  await page.locator("#complete-mission-button").click();

  await expect(page.getByRole("heading", { name: /great job|браво/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /save your progress|запази прогреса си/i })).toBeVisible();
});
