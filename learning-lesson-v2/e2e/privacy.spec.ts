import { test, expect } from "@playwright/test";

test("privacy page is public and links back to profile actions", async ({ page }) => {
  await page.goto("/privacy");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/поверителност|privacy/i);
  await expect(page.locator('main a[href="/profile"]')).toBeVisible();
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
});
