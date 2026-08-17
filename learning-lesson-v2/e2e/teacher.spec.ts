import { expect, test, type Page } from "@playwright/test";
import { enableE2eAuth } from "./helpers/mentor";

async function mockCreateClassroom(page: Page, classroomId = "e2e-classroom-1") {
  await page.route("**/api/teacher/classrooms", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as { name?: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        classroom: {
          id: classroomId,
          name: body.name ?? "E2E Class",
          joinCode: "ABCD12"
        }
      })
    });
  });
}

test.describe("teacher happy path", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2eAuth(page, { role: "teacher" });
  });

  test("teacher hub renders with class and review actions", async ({ page }) => {
    await page.goto("/teacher");
    await expect(page.getByRole("heading", { name: /teacher hub|учителски център/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create (a )?class|създай клас/i }).first()).toBeVisible();
  });

  test("classes page shows create form when empty", async ({ page }) => {
    await page.goto("/teacher/classes");
    await expect(page.getByRole("heading", { name: /create a new class|създай нов клас/i })).toBeVisible();
    await expect(page.locator("#classroom-name")).toBeVisible();
  });

  test("teacher can submit create-class form through the API", async ({ page }) => {
    await mockCreateClassroom(page);
    await page.goto("/teacher/classes");

    await page.locator("#classroom-name").fill("8A Pilot");
    await page.getByRole("button", { name: /^(create class|създай клас)$/i }).click();

    await expect(page).toHaveURL(/\/teacher\/classes\/e2e-classroom-1/);
  });
});

test("student cannot open the class gradebook", async ({ page }) => {
  await enableE2eAuth(page);
  await page.goto("/teacher/classes/e2e-classroom-1/gradebook");
  await expect(page).toHaveURL(/\/dashboard/);
});
