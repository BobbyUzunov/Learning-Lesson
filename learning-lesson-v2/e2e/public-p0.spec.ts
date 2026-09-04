import { test, expect } from "@playwright/test";

test("demo mission is public and awards sample XP", async ({ page }) => {
  await page.goto("/demo");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/демо|demo/i);

  await page.getByRole("button", { name: /към задачата|go to the task/i }).click();
  await page.getByRole("button", { name: /заглавие|title/i }).click();
  await page.getByRole("button", { name: /^текст$|^body$/i }).click();
  await page.getByRole("button", { name: /бутон|button/i }).click();
  await page.getByRole("button", { name: /към проверката|go to the check/i }).click();
  await page.getByRole("button", { name: /\+100 xp/i }).click();

  await expect(page.locator("main")).toContainText(/\+100 xp/i);
  await expect(page.locator('main a[href="/register"]')).toBeVisible();
});

test("for-teachers shows product preview and honest access copy", async ({ page }) => {
  await page.goto("/for-teachers");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/примерен|sample/i);
  await expect(page.locator("main")).toContainText(/пилот|pilot/i);
  await expect(page.locator("main")).not.toContainText(/регистрация без админ|no admin approval needed/i);
  await expect(page.locator('main a[href="/register/teacher"]').first()).toBeVisible();
});

test("legal pages are public from the footer", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
  await expect(page.locator('footer a[href="/cookies"]')).toBeVisible();
  await expect(page.locator('footer a[href="/contact"]')).toBeVisible();

  for (const path of ["/terms", "/cookies", "/contact"] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("home links to demo without account", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('main a[href="/demo"]')).toBeVisible();
  await expect(page.locator('header a[href="/demo"]').first()).toBeVisible();
});
