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

test("guest completion hydrates the linked curriculum mission and lab", async ({ page }) => {
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

  await page.getByRole("button", { name: /continue as guest|продължи като гост/i }).click();
  await expect(page).toHaveURL(/\/paths/);

  await page
    .getByRole("button", { name: /first page for your class|първата страница на класа/i })
    .click();
  const recommendedMission = page.locator("#recommended-mission");
  await expect(recommendedMission).toContainText(/lab completed|лабораторията е завършена/i);
  await expect(recommendedMission).toContainText("1/1");

  await recommendedMission.getByRole("link", { name: /view mission|виж мисията/i }).click();
  await expect(page).toHaveURL(/\/missions\/mission-first-class-page/);

  const missionLab = page.locator("section").filter({
    hasText: /connected technology lab|свързана техно лаборатория/i
  });
  await expect(missionLab).toContainText(/lab completed|лабораторията е завършена/i);
  await expect(missionLab).toContainText("1/1");
  await expect(missionLab).toContainText(/100 XP earned|спечелени 100 XP/i);
});
