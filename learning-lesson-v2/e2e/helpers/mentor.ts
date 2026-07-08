import type { Page } from "@playwright/test";

export async function enableE2eAuth(page: Page) {
  await page.context().addCookies([
    {
      name: "e2e-auth",
      value: "1",
      url: "http://127.0.0.1:3000"
    }
  ]);
}

export async function mockMentorApi(
  page: Page,
  options: {
    remaining?: number;
    hint?: string;
  } = {}
) {
  const remaining = options.remaining ?? 5;
  const limit = 5;
  const hint =
    options.hint ?? "Try structuring your page with header, main, and footer sections before adding styles.";

  await page.route("**/api/mentor", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          remaining,
          limit,
          count: limit - remaining
        })
      });
      return;
    }

    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hint,
          remaining: Math.max(remaining - 1, 0),
          limit
        })
      });
      return;
    }

    await route.continue();
  });
}
