import { expect, test } from "@playwright/test";
import { enableE2eAuth, mockMentorApi } from "./helpers/mentor";

test("login welcomes all roles and unknown addresses show Bulgarian 404", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Вход за ученици, учители и администратори. Влез с имейла и паролата си.")).toBeVisible();
  const response = await page.goto("/this-page-does-not-exist-p0");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Страницата не е намерена" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Към началото", exact: true })).toHaveAttribute("href", "/");
});

for (const role of ["user", "teacher"] as const) {
  test(`${role} gets an explanation for denied admin access and can return home`, async ({ page }) => {
    await enableE2eAuth(page, { role });
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/access-denied$/);
    await expect(page.getByRole("heading", { name: "Нямаш достъп до тази страница" })).toBeVisible();
    await page.getByRole("link", { name: "Към началото", exact: true }).click();
    await expect(page).toHaveURL(role === "teacher" ? /\/teacher$/ : /\/dashboard$/);
  });
}

test("guest admin access still requires login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("404 follows the selected language", async ({ page }) => {
  await page.context().addCookies([{ name: "ll_lang", value: "en", url: "http://127.0.0.1:3100" }]);
  await page.goto("/this-page-does-not-exist-p0");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("submission failure is readable and retry confirms submission", async ({ page }) => {
  await enableE2eAuth(page);
  await mockMentorApi(page);
  let attempts = 0;
  await page.route("**/api/assignments/e2e-assignment/submit", async (route) => {
    attempts += 1;
    await route.fulfill({ status: attempts === 1 ? 500 : 200, contentType: "application/json", body: JSON.stringify(attempts === 1 ? { error: "internal_database_error" } : { ok: true }) });
  });
  await page.goto("/assignments/e2e-assignment");
  await page.locator("form textarea").first().fill("Моето решение с обяснение на стъпките.");
  const submit = page.getByRole("button", { name: "Предай", exact: true });
  await submit.click();
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).not.toContainText("internal_database_error");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("status").filter({ hasText: "Предадено успешно." })).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(submit).toBeDisabled();
  expect(attempts).toBe(2);
});

test("invalid AI usage response shows a readable error and a successful request recovers", async ({ page }) => {
  await enableE2eAuth(page);
  await mockMentorApi(page);
  let invalidUsage = true;
  await page.route("**/api/mentor", async (route) => {
    if (route.request().method() === "GET" && invalidUsage) {
      invalidUsage = false;
      await route.fulfill({ status: 200, contentType: "application/json", body: "not-json" });
      return;
    }
    await route.fallback();
  });
  await page.goto("/assignments/e2e-assignment");
  await expect(page.locator("main").getByRole("alert")).toContainText("Лимитът за AI насоки не е наличен");
  await page.getByTestId("mentor-primary-cta").click();
  await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(/остават 4 AI насоки/i)).toBeVisible();
});
