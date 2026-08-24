import { test, expect } from "@playwright/test";
import { enableE2eAuth } from "./helpers/mentor";
import { openLessonTask } from "./helpers/lesson";

const phone = { width: 390, height: 844 };
const smallPhone = { width: 320, height: 568 };

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      overflowing: doc.scrollWidth > window.innerWidth + 1,
      scrollWidth: doc.scrollWidth,
      innerWidth: window.innerWidth
    };
  });
  expect(overflow, `horizontal overflow ${overflow.scrollWidth}px > ${overflow.innerWidth}px`).toEqual(
    expect.objectContaining({ overflowing: false })
  );
}

test.describe("mobile layout", () => {
  test.use({ viewport: phone });

  test("home page fits mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("login and register pages fit mobile viewport", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#email")).toHaveAttribute("autocomplete", "email");
    await expect(page.locator("#password")).toHaveAttribute("autocomplete", "current-password");
    await expectNoHorizontalOverflow(page);

    await page.goto("/register");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#password")).toHaveAttribute("autocomplete", "new-password");
    await expectNoHorizontalOverflow(page);
  });

  test("for-teachers page fits mobile viewport", async ({ page }) => {
    await page.goto("/for-teachers");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("paths page fits mobile viewport", async ({ page }) => {
    await enableE2eAuth(page);
    await page.goto("/paths");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("dashboard, inbox, classes and profile fit mobile viewport", async ({ page }) => {
    await enableE2eAuth(page);
    for (const path of ["/dashboard", "/inbox", "/classes", "/profile"] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("lesson page fits mobile viewport", async ({ page }) => {
    await enableE2eAuth(page);
    await page.goto("/lesson/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /stages|етапи/i })).toBeVisible();
    await openLessonTask(page);
    await expectNoHorizontalOverflow(page);
  });

  test("teacher hub fits mobile viewport", async ({ page }) => {
    await enableE2eAuth(page, { role: "teacher" });
    await page.goto("/teacher");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.goto("/teacher/classes");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("narrow phone layout", () => {
  test.use({ viewport: smallPhone });

  test("home and login fit 320px viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("authenticated student pages fit 320px viewport", async ({ page }) => {
    await enableE2eAuth(page);
    await page.goto("/paths");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/lesson/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
