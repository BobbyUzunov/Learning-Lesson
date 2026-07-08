import { test, expect } from "@playwright/test";

test("mobile menu opens, locks scroll, and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByTestId("mobile-menu-button");
  await expect(toggle).toBeVisible();
  await toggle.click();

  const panel = page.getByTestId("mobile-menu-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /paths|пътеки/i })).toBeVisible();
  await expect(panel.getByRole("link", { name: /login|вход/i })).toBeVisible();

  await expect
    .poll(async () => page.evaluate(() => document.body.classList.contains("mobile-menu-open")))
    .toBe(true);

  await panel.getByRole("link", { name: /paths|пътеки/i }).click();
  await expect(panel).toHaveCount(0);
  await expect
    .poll(async () => page.evaluate(() => document.body.classList.contains("mobile-menu-open")))
    .toBe(false);
});
