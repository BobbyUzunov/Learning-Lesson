import { expect, test } from "@playwright/test";
import { enableE2eAuth } from "./helpers/mentor";

test("assessment list requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/assessments")]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("assessment workspace requires login", async ({ page }) => {
  await Promise.all([page.waitForURL(/\/login/), page.goto("/assessments/example")]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("learners cannot open the teacher panel", async ({ page }) => {
  await enableE2eAuth(page);
  await page.goto("/teacher");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("student inbox is reachable from the header", async ({ page }) => {
  await enableE2eAuth(page);
  await page.goto("/dashboard");

  await expect(page.locator('header a[href="/inbox"]').first()).toBeVisible();
  await page.locator('header a[href="/inbox"]').first().click();
  await expect(page).toHaveURL(/\/inbox/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toContainText(/сигнали|alerts/i);
});

test("teacher panel shows create-class CTA when there are no classrooms", async ({ page }) => {
  await enableE2eAuth(page, { role: "teacher" });
  await page.goto("/teacher");
  await expect(page.getByRole("heading", { name: /teacher hub|учителски център/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /create (a )?class|създай клас/i }).first()).toBeVisible();
});

test("teacher close-assessment API returns a stable public error without a real assessment", async ({
  page
}) => {
  await enableE2eAuth(page, { role: "teacher" });
  await page.goto("/teacher");

  const response = await page.request.post("/api/teacher/assessments/missing-id/close");
  // With E2E teacher auth + fake Supabase URL the RPC fails after the gate; without
  // Supabase config the route is 503. Never leak a raw Postgres exception blob.
  expect([400, 403, 404, 500, 503]).toContain(response.status());
  const body = (await response.json()) as { error?: string };
  expect(typeof body.error).toBe("string");
  expect(body.error).toMatch(/^[a-z0-9_]+$/i);
  expect(body.error).not.toMatch(/\s/);
});

test("student assessment submit API rejects unauthenticated callers", async ({ request }) => {
  const response = await request.post("/api/assessments/example/submit", {
    data: { answers: { q1: 0 } }
  });
  expect([401, 503]).toContain(response.status());
});
