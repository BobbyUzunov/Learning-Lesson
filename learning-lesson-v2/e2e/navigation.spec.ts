import { test, expect } from "@playwright/test";

test("home page shows hero and paths CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /paths|пътеки/i })).toBeVisible();
});

test("paths page lists learning quests", async ({ page }) => {
  await page.goto("/paths");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/quest|мисия|backend|frontend/i);
});
