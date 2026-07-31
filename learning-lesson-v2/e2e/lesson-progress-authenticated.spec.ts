import { expect, test, type Page } from "@playwright/test";
import { enableE2eAuth } from "./helpers/mentor";
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
import type {
  KnowledgeCheckAnswer,
  KnowledgeCheckContent
} from "../src/lib/knowledge-check/types";

const knowledgeCheckContent: KnowledgeCheckContent = {
  questions: fallbackKnowledgeCheckBank,
  lessonTopics: fallbackLessonKnowledgeCheckMap,
  source: "fallback"
};

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function completePassingKnowledgeCheck(page: Page, lessonId = "1") {
  await page.goto(`/lesson/${lessonId}`);
  await openLessonTask(page);
  await page.locator("#lesson-solution").fill("Built a complete semantic solution for this lesson task.");
  await page.getByRole("button", { name: /check my attempt|провери опита/i }).click();

  const topic = getKnowledgeCheckTopicForLesson(knowledgeCheckContent, lessonId);
  expect(topic).not.toBeNull();
  const questions = generateKnowledgeCheckQuestions(
    knowledgeCheckContent,
    topic!,
    3,
    createSeededRandom(`${lessonId}:0`)
  );
  const questionCards = page.locator("article article");
  await expect(questionCards).toHaveCount(questions.length);

  for (const [index, question] of questions.entries()) {
    await questionCards.nth(index).getByRole("radio").nth(question.correctIndex).click();
  }

  await page.getByRole("button", { name: /check answers|провери отговорите/i }).click();
  await expect(page.getByText(/(?:result|резултат):\s*3\s*\/\s*3/i)).toBeVisible();

  const answers: KnowledgeCheckAnswer[] = questions.map((question) => {
    const original = fallbackKnowledgeCheckBank.find((candidate) => candidate.id === question.id);
    expect(original).toBeDefined();
    return { questionId: question.id, selectedIndex: original!.correctIndex };
  });

  return answers;
}

test.beforeEach(async ({ page }) => {
  await enableE2eAuth(page);
});

test("authenticated completion posts original option indexes and exposes next lesson only after 200", async ({
  page
}) => {
  const requestSeen = deferred();
  const allowSuccess = deferred();
  let postedBody: { lessonId?: string; knowledgeCheckAnswers?: KnowledgeCheckAnswer[] } | null = null;

  await page.route("**/api/progress", async (route) => {
    postedBody = route.request().postDataJSON() as {
      lessonId?: string;
      knowledgeCheckAnswers?: KnowledgeCheckAnswer[];
    };
    requestSeen.resolve();
    await allowSuccess.promise;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, xp: 100, level: 2 })
    });
  });

  const expectedAnswers = await completePassingKnowledgeCheck(page);
  const nextLessonButton = page.getByRole("button", {
    name: /go to next lesson|към следващия урок/i
  });
  const savedCompletion = page.getByText(/lesson completed|урокът е завършен/i);

  await page.locator("#complete-mission-button").click();
  await requestSeen.promise;

  expect(postedBody).toEqual({ lessonId: "1", knowledgeCheckAnswers: expectedAnswers });
  await expect(savedCompletion).toHaveCount(0);
  await expect(nextLessonButton).toHaveCount(0);

  allowSuccess.resolve();

  await expect(savedCompletion).toBeVisible({ timeout: 1_000 });
  await expect(nextLessonButton).toBeVisible({ timeout: 1_000 });
});

test("server rejection removes the local pass claim and never exposes a next-lesson CTA", async ({ page }) => {
  await page.route("**/api/progress", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: "knowledge_check_not_passed" })
    });
  });

  await completePassingKnowledgeCheck(page);
  const localPassingScore = page.getByText(/(?:result|резултат):\s*3\s*\/\s*3/i);
  await expect(localPassingScore).toBeVisible();

  await page.locator("#complete-mission-button").click();

  await expect(localPassingScore).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /go to next lesson|към следващия урок/i })
  ).toHaveCount(0);
  await expect(page.locator("#complete-mission-button")).toBeDisabled();
});

test("server unavailability removes stale questions and keeps lesson completion locked", async ({ page }) => {
  await page.route("**/api/progress", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "quiz_unavailable" })
    });
  });

  await completePassingKnowledgeCheck(page);
  await page.locator("#complete-mission-button").click();

  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(
    page.getByRole("alert").filter({ hasText: /temporarily unavailable|временно не могат/i })
  ).toBeVisible();
  await expect(page.locator("#complete-mission-button")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /go to next lesson|към следващия урок/i })
  ).toHaveCount(0);
});
