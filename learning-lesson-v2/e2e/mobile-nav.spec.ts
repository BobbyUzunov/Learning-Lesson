import { test, expect } from "@playwright/test";

test("mobile menu opens, locks scroll, and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByTestId("mobile-menu-button");
  await expect(toggle).toBeVisible();
  await toggle.click();

  const panel = page.getByTestId("mobile-menu-panel");
  const overlay = page.getByTestId("mobile-menu-overlay");
  await expect(panel).toBeVisible();
  await expect(overlay).toBeVisible();
  await expect(panel.locator('a[href="/for-teachers"]')).toBeVisible();
  await expect(panel.getByRole("link", { name: /login|вход/i })).toBeVisible();

  await expect
    .poll(async () => page.evaluate(() => document.body.classList.contains("mobile-menu-open")))
    .toBe(true);

  await panel.locator('a[href="/for-teachers"]').click();
  await expect(panel).toHaveCount(0);
  await expect
    .poll(async () => page.evaluate(() => document.body.classList.contains("mobile-menu-open")))
    .toBe(false);
});

test("mobile menu closes from overlay and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByTestId("mobile-menu-button").click();
  const overlay = page.getByTestId("mobile-menu-overlay");
  await expect(page.getByTestId("mobile-menu-panel")).toBeVisible();
  await expect(overlay).toBeVisible();

  const box = await overlay.boundingBox();
  expect(box).toBeTruthy();
  await overlay.click({ position: { x: 24, y: Math.max(24, (box?.height ?? 48) - 24) } });
  await expect(page.getByTestId("mobile-menu-panel")).toHaveCount(0);

  await page.getByTestId("mobile-menu-button").click();
  await expect(page.getByTestId("mobile-menu-panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("mobile-menu-panel")).toHaveCount(0);
});
