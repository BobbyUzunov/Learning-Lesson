import { expect, type Page } from "@playwright/test";

export async function openLessonTask(page: Page) {
  await page.getByRole("button", { name: /go to the task|към задачата/i }).click();
  await expect(page.locator("#lesson-solution")).toBeVisible();
}

export async function revealLessonMentor(page: Page) {
  await openLessonTask(page);
  await page.getByRole("button", { name: /show a hint|покажи подсказка/i }).click();
  await expect(page.getByRole("main").getByText(/AI mentor|AI наставник/i)).toBeVisible();
}

export async function openAuthenticatedLessonMentor(page: Page) {
  await revealLessonMentor(page);
  await page.getByRole("button", { name: /need some direction|нужда от насока/i }).click();
}
