import { test, expect } from "@playwright/test";
import { enableE2eAuth, mockMentorApi } from "./helpers/mentor";

test.describe("mentor guest", () => {
  test("guest sees AI hint signup prompt on lesson 1", async ({ page }) => {
    await page.goto("/lesson/1");

    await expect(page.getByRole("main").getByText(/AI подсказка|AI hint/i)).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /create account|създай акаунт/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ask AI hint|поискай AI hint/i })).toHaveCount(0);
    await expect(page.locator("#mentor-question-1")).toHaveCount(0);
  });
});

test.describe("mentor authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2eAuth(page);
    await mockMentorApi(page);
  });

  test("authenticated user sees remaining mentor quota", async ({ page }) => {
    await page.goto("/lesson/1");

    await expect(page.getByText(/остават 5 AI hints|5 AI hints left today/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ask AI hint|поискай AI hint/i })).toBeVisible();
  });

  test("authenticated user can request a mentor hint", async ({ page }) => {
    await page.goto("/lesson/1");

    await page
      .locator("#mentor-question-1")
      .fill("I do not know how to structure the HTML sections for this lesson task.");
    await page.getByRole("button", { name: /ask AI hint|поискай AI hint/i }).click();

    await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    await expect(page.getByText(/остават 4 AI hints|4 AI hints left today/i)).toBeVisible();
  });

  test("authenticated user with no quota left sees limit message", async ({ page }) => {
    await mockMentorApi(page, { remaining: 0 });
    await page.goto("/lesson/1");

    await expect(page.getByText(/достигна дневния лимит|daily AI hint limit reached/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ask AI hint|поискай AI hint/i })).toHaveCount(0);
  });
});
