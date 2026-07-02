import { test, expect } from "@playwright/test";

test("mobile menu opens and shows navigation links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const toggle = page.getByTestId("mobile-menu-button");
  await expect(toggle).toBeVisible();
  await toggle.click();

  const panel = page.getByTestId("mobile-menu-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /paths|пътеки/i })).toBeVisible();
  await expect(panel.getByRole("link", { name: /login|вход/i })).toBeVisible();
});
