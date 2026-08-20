import { test, expect } from "@playwright/test";
import { openLessonTask } from "./helpers/lesson";
import { enableE2eAuth, mockMentorApi, openAssignmentMentor } from "./helpers/mentor";

test.describe("mentor guest", () => {
  test("guest is sent to login instead of the assignment mentor", async ({ page }) => {
    await page.goto("/assignments/e2e-assignment");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("mentor authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2eAuth(page);
    await mockMentorApi(page);
  });

  test("authenticated student sees remaining mentor quota on an assigned mission", async ({ page }) => {
    await openAssignmentMentor(page);
    await expect(page.getByText(/остават 5 AI насоки|5 AI directions left today/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /help me get started|помогни ми да започна/i })).toBeVisible();
  });

  test("authenticated student can request a mentor hint", async ({ page }) => {
    await openAssignmentMentor(page);
    await page.getByRole("button", { name: /help me get started|помогни ми да започна/i }).click();

    await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    await expect(page.getByText(/остават 4 AI насоки|4 AI directions left today/i)).toBeVisible();
  });

  test("authenticated student with no quota left sees limit message", async ({ page }) => {
    await mockMentorApi(page, { remaining: 0 });
    await page.goto("/assignments/e2e-assignment");

    await expect(page.getByText(/достигна дневния лимит|reached today's AI direction limit/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /help me get started|помогни ми да започна/i })).toHaveCount(0);
  });

  test("lesson task stage does not show the AI mentor", async ({ page }) => {
    await page.goto("/lesson/1");
    await openLessonTask(page);
    await expect(page.getByRole("main").getByText(/AI mentor|AI наставник/i)).toHaveCount(0);
  });
});
