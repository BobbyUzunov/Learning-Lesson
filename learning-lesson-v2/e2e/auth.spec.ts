import { test, expect } from "@playwright/test";

test("login page shows forgot password link", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /forgot password|забравена парола/i })).toBeVisible();
});

test("login register tab opens the student signup page", async ({ page }) => {
  await page.goto("/login");

  await page.locator("form").getByRole("link", { name: /register|регистрация/i }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/create a student account|създай ученически профил/i);
  await expect(page.getByRole("button", { name: /create account|създай профил/i })).toBeVisible();
});

test("register page explains password rules without listing every character", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByText(/потвърждение|confirmation/i).first()).toBeVisible();
  await expect(page.getByText(/малка буква|lowercase letter/i)).toBeVisible();
  await expect(page.getByText(/поне 8|at least 8/i)).toBeVisible();
  await expect(page.locator("#password-requirements")).toBeVisible();
  await expect(page.getByRole("button", { name: /покажи паролата|show password/i })).toBeVisible();
  await expect(page.getByText("abcdefghijklmnopqrstuvwxyz")).toHaveCount(0);
});

test("dashboard requires login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);
});

test("inbox requires login", async ({ page }) => {
  await page.goto("/inbox");

  await expect(page).toHaveURL(/\/login/);
});

test("forgot password page renders reset form", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByRole("button", { name: /send reset link|изпрати линк/i })).toBeVisible();
});
