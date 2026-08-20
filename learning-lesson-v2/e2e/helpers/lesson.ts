import { expect, type Page } from "@playwright/test";

export async function openLessonTask(page: Page) {
  await page.getByRole("button", { name: /go to the task|към задачата/i }).click();
  await expect(page.locator("#lesson-solution")).toBeVisible();
}

/** Lesson "check attempt" CTA — not the AI mentor "review my attempt" button. */
export async function clickLessonCheckAttempt(page: Page) {
  await page.getByRole("button", { name: /^(check my attempt|провери опита)$/i }).click();
}
