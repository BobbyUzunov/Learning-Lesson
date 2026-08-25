import { test, expect } from "@playwright/test";

test("login page shows forgot password link", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /forgot password|забравена парола/i })).toBeVisible();
});

test("register page explains password rules without listing every character", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByText(/малка буква|lowercase letter/i)).toBeVisible();
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
