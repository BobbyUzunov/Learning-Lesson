import { expect, test } from "@playwright/test";

test("assessment list requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/assessments")]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("assessment workspace requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/assessments/example")]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
