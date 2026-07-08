import { test, expect } from "@playwright/test";

const mobileViewport = { width: 390, height: 844 };

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
}

test.describe("mobile layout", () => {
  test.use({ viewport: mobileViewport });

  test("home page fits mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("paths page fits mobile viewport", async ({ page }) => {
    await page.goto("/paths");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("lesson page fits mobile viewport", async ({ page }) => {
    await page.goto("/lesson/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#lesson-solution")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
