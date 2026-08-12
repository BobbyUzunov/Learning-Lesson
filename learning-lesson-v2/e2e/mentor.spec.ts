import { test, expect } from "@playwright/test";
import { enableE2eAuth, mockMentorApi } from "./helpers/mentor";
import { openAuthenticatedLessonMentor, revealLessonMentor } from "./helpers/lesson";

test.describe("mentor guest", () => {
  test("guest sees AI hint signup prompt on lesson 1", async ({ page }) => {
    await page.goto("/lesson/1");

    await revealLessonMentor(page);
    await expect(page.getByRole("main").getByRole("link", { name: /sign up|регистрация/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /need some direction|нужда от насока/i })).toHaveCount(0);
  });
});

test.describe("mentor authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2eAuth(page);
    await mockMentorApi(page);
  });

  test("authenticated user sees remaining mentor quota", async ({ page }) => {
    await page.goto("/lesson/1");

    await openAuthenticatedLessonMentor(page);
    await expect(page.getByText(/остават 5 AI насоки|5 AI directions left today/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /help me get started|помогни ми да започна/i })).toBeVisible();
  });

  test("authenticated user can request a mentor hint", async ({ page }) => {
    await page.goto("/lesson/1");

    await openAuthenticatedLessonMentor(page);
    await page.getByRole("button", { name: /help me get started|помогни ми да започна/i }).click();

    await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    await expect(page.getByText(/остават 4 AI насоки|4 AI directions left today/i)).toBeVisible();
  });

  test("authenticated user with no quota left sees limit message", async ({ page }) => {
    await mockMentorApi(page, { remaining: 0 });
    await page.goto("/lesson/1");

    await revealLessonMentor(page);
    await expect(page.getByText(/достигна дневния лимит|reached today's AI direction limit/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /help me get started|помогни ми да започна/i })).toHaveCount(0);
  });
});
