import { test, expect } from "@playwright/test";

test("certificate page requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/certificate/frontend")]);
});

test("profile page requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/profile")]);
});

test("dashboard requires login before certificate access", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/certificate/ai-product-builder")]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
