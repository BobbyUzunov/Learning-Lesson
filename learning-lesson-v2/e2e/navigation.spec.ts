import { test, expect } from "@playwright/test";
import { enableE2eAuth } from "./helpers/mentor";

test("home page shows role signup CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('main a[href="/register"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/register/teacher"]').first()).toBeVisible();
  await expect(page.locator("main")).toContainText(/как започваш|how you start/i);
  await expect(page.locator("main ol li")).toHaveCount(3);
  await expect(page.locator('main a[href="/lesson/1"]')).toHaveCount(0);
});

test("guest cannot open lessons or the learning program", async ({ page }) => {
  await page.goto("/lesson/1");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/paths");
  await expect(page).toHaveURL(/\/login/);
});

test("paths page lists learning program", async ({ page }) => {
  await enableE2eAuth(page);
  await page.goto("/paths");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/program|програма|direction|направление|backend|frontend/i);
});
