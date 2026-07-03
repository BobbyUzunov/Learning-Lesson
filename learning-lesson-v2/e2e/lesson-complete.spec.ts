import { test, expect } from "@playwright/test";

test("guest can open the first free lesson", async ({ page }) => {
  await page.goto("/lesson/1");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#lesson-solution")).toBeVisible();
});

test("guest cannot open locked lessons", async ({ page }) => {
  await page.goto("/lesson/2", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/paths\?guestLocked=1/, { timeout: 15_000 });
});

test("guest completes the first lesson and sees signup prompt", async ({ page }) => {
  await page.goto("/lesson/1");

  await page.locator("#lesson-solution").fill("Built a semantic HTML page with header, main, and footer sections.");
  await page.getByRole("button", { name: /complete lesson|завърши урока/i }).click();

  await expect(page.getByRole("heading", { name: /great job|браво/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /create account|създай акаунт/i })).toBeVisible();
});
