import { test, expect } from "@playwright/test";

test("guest is redirected away from lessons", async ({ page }) => {
  await page.goto("/lesson/1");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/lesson/2", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
});
