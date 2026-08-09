import type { Page } from "@playwright/test";

export async function enableE2eAuth(page: Page, options: { role?: "user" | "teacher" | "admin" } = {}) {
  const cookies = [
    {
      name: "e2e-auth",
      value: "1",
      url: "http://127.0.0.1:3100"
    }
  ];

  if (options.role && options.role !== "user") {
    cookies.push({
      name: "e2e-role",
      value: options.role,
      url: "http://127.0.0.1:3100"
    });
  }

  await page.context().addCookies(cookies);
}

export async function mockMentorApi(
  page: Page,
  options: {
    remaining?: number;
    hint?: string;
  } = {}
) {
  let remaining = options.remaining ?? 5;
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
      remaining = Math.max(remaining - 1, 0);
      const textId = "mentor-text-1";
      const streamBody = [
        { type: "start", messageId: "mentor-message-1" },
        { type: "text-start", id: textId },
        { type: "text-delta", id: textId, delta: hint },
        { type: "text-end", id: textId },
        { type: "finish", finishReason: "stop" }
      ]
        .map((part) => `data: ${JSON.stringify(part)}\n\n`)
        .join("")
        .concat("data: [DONE]\n\n");

      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: {
          "cache-control": "no-cache",
          "x-mentor-limit": String(limit),
          "x-mentor-remaining": String(remaining),
          "x-vercel-ai-ui-message-stream": "v1"
        },
        body: streamBody
      });
      return;
    }

    await route.continue();
  });
}
