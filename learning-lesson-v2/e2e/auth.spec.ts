import { test, expect } from "@playwright/test";

test("login page shows forgot password link", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /forgot password|забравена парола/i })).toBeVisible();
});

test("register page renders signup form", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /create account|създай акаунт/i })).toBeVisible();
});

test("dashboard requires login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);
});

test("forgot password page renders reset form", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByRole("button", { name: /send reset link|изпрати линк/i })).toBeVisible();
});
