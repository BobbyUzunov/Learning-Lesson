import { test, expect } from "@playwright/test";

test("home page shows role signup CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('main a[href="/register"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/register/teacher"]').first()).toBeVisible();
});

test("paths page lists learning program", async ({ page }) => {
  await page.goto("/paths");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/program|програма|direction|направление|backend|frontend/i);
});
