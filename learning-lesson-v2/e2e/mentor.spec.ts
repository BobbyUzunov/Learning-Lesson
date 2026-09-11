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

  test("refresh restores the same direction and remaining daily quota", async ({ page }) => {
    await openAssignmentMentor(page);
    await page.getByRole("button", { name: /help me get started|помогни ми да започна/i }).click();
    await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    await expect(page.getByText(/остават 4 AI насоки|4 AI directions left today/i)).toBeVisible();

    await page.reload();

    await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    await expect(page.getByText(/остават 4 AI насоки|4 AI directions left today/i)).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: /Насока 1 от 3|Direction 1 of 3/i })).toBeVisible();
  });

  test("a failed request without quota headers keeps the quota and allows retry", async ({ page }) => {
    let failed = false;
    await page.route("**/api/mentor", async (route) => {
      if (route.request().method() === "POST" && !failed) {
        failed = true;
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "mentor_usage_unavailable" })
        });
        return;
      }
      await route.fallback();
    });

    await openAssignmentMentor(page);
    await expect(page.getByText(/остават 5 AI насоки|5 AI directions left today/i)).toBeVisible();
    const cta = page.getByTestId("mentor-primary-cta");
    const failedResponse = page.waitForResponse((response) =>
      response.url().endsWith("/api/mentor") && response.request().method() === "POST" && response.status() === 503
    );
    await cta.click();
    await failedResponse;
    await expect(page.getByText(/Лимитът за AI насоки не е наличен|The AI direction limit is unavailable/i)).toBeVisible();
    await expect(cta).toBeEnabled();
    await expect(page.getByText(/остават 5 AI насоки|5 AI directions left today/i)).toBeVisible();
    await expect(page.getByText(/достигна дневния лимит|reached today's AI direction limit/i)).toHaveCount(0);

    await cta.click();
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
