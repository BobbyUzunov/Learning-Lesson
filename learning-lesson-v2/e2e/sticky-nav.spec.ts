import { test, expect } from "@playwright/test";
import { enableE2eAuth, mockMentorApi, openAssignmentMentor } from "./helpers/mentor";

async function assertMentorNotCoveredByHeader(page: import("@playwright/test").Page) {
  const mentor = page.getByTestId("mentor-primary-cta");
  await expect(mentor).toBeVisible();
  await mentor.scrollIntoViewIfNeeded();

  const result = await page.evaluate(() => {
    const button = document.querySelector('[data-testid="mentor-primary-cta"]');
    const header = document.querySelector('[data-testid="site-header"]');
    if (!(button instanceof HTMLElement) || !(header instanceof HTMLElement)) {
      return { ok: false, reason: "missing-elements" as const };
    }

    const buttonBox = button.getBoundingClientRect();
    const headerBox = header.getBoundingClientRect();
    const x = buttonBox.left + buttonBox.width / 2;
    const y = buttonBox.top + buttonBox.height / 2;
    const topEl = document.elementFromPoint(x, y);

    return {
      ok: true as const,
      overlapsHeader: buttonBox.top < headerBox.bottom - 1,
      hitIsButton: Boolean(topEl?.closest('[data-testid="mentor-primary-cta"]')),
      hitIsHeader: Boolean(topEl?.closest('[data-testid="site-header"]')),
      headerBottom: headerBox.bottom,
      buttonTop: buttonBox.top
    };
  });

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.overlapsHeader, `mentor under header (top=${result.buttonTop}, headerBottom=${result.headerBottom})`).toBe(
      false
    );
    expect(result.hitIsHeader).toBe(false);
    expect(result.hitIsButton).toBe(true);
  }
}

test.describe("sticky nav does not cover mission actions", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2eAuth(page);
    await mockMentorApi(page);
  });

  for (const viewport of [
    { width: 1280, height: 720, name: "desktop" },
    { width: 390, height: 844, name: "phone" }
  ] as const) {
    test(`${viewport.name}: mentor CTA stays clickable under site header`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await openAssignmentMentor(page);

      const header = page.getByTestId("site-header");
      await expect(header).toBeVisible();

      const position = await header.evaluate((node) => getComputedStyle(node).position);
      expect(position).not.toBe("fixed");
      expect(position).not.toBe("sticky");

      await assertMentorNotCoveredByHeader(page);

      await page.getByTestId("mentor-primary-cta").click();
      await expect(page.getByText(/header, main, and footer/i)).toBeVisible();
    });
  }

  test("phone: scrolling the mission page keeps header outside the scrollport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAssignmentMentor(page);

    await page.evaluate(() => {
      const scroller = document.getElementById("site-scroll");
      if (scroller) {
        scroller.scrollTop = 400;
      }
    });

    await assertMentorNotCoveredByHeader(page);
  });
});
