import { expect, type Page } from "@playwright/test";

export async function openLessonTask(page: Page) {
  await page.getByRole("button", { name: /go to the task|към задачата/i }).click();
  await expect(page.locator("#lesson-solution")).toBeVisible();
}

export async function revealLessonMentor(page: Page) {
  await openLessonTask(page);
  await expect(page.getByRole("main").getByText(/AI mentor|AI наставник/i)).toBeVisible();
}

export async function openAuthenticatedLessonMentor(page: Page) {
  await revealLessonMentor(page);
  await expect(
    page.getByRole("button", { name: /help me get started|помогни ми да започна/i })
  ).toBeVisible();
}
