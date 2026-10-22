import { test, expect } from "@playwright/test";

const click = (page, action) =>
  page.locator(`[data-action="${action}"]`).first().click();
const code = async (page) =>
  (await page.getByTestId("visible-code").innerText()).replace(/[^0-9]/g, "");
async function setup(page, locale = "en") {
  await page.goto("/");
  if (locale === "zh-TW") await click(page, "language");
  await click(page, "start");
  await page.locator("#commander").fill("sky");
  await page
    .locator("#commander-form")
    .evaluate((form) => form.requestSubmit());
  await expect(page.locator('[data-action="begin"]')).toBeVisible();
}
async function solve(page) {
  const answer = await code(page);
  await click(page, "ready");
  await expect(page.getByTestId("visible-code")).toHaveCount(0);
  await page.locator("#recall-input").fill(answer);
  await page
    .locator("#authorize-form")
    .evaluate((form) => form.requestSubmit());
}

test("full seven-launch campaign, certificate, persistence, and replay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await setup(page);
  for (let i = 0; i < 7; i++) {
    await click(page, "begin");
    expect((await code(page)).length).toBe(i + 3);
    await solve(page);
    await expect(
      page.getByText("First-try independent clear", { exact: true }),
    ).toBeVisible();
    if (i < 6) await click(page, "next");
    else await click(page, "certificate");
  }
  await expect(page.locator(".certificate")).toContainText("SKY");
  await expect(page.locator(".certificate")).toContainText("7 / 7");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.best).toBe(9);
  expect(saved.completed).toHaveLength(7);
  expect(saved.code).toBeUndefined();
  await page.screenshot({
    path: "docs/screenshots/completion-en-desktop.png",
    fullPage: true,
  });
  await page.reload();
  await click(page, "start");
  await expect(page.locator(".certificate")).toBeVisible();
  await click(page, "replay");
  const replay = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(replay.completed).toHaveLength(0);
  expect(replay.best).toBe(9);
  expect(errors).toEqual([]);
});

test("wrong guess remains hidden; help is assisted; fresh code is independent", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page);
  await click(page, "begin");
  const original = await code(page);
  await click(page, "ready");
  await page.locator("#recall-input").fill(original === "999" ? "888" : "999");
  await page
    .locator("#authorize-form")
    .evaluate((form) => form.requestSubmit());
  await expect(page.getByTestId("visible-code")).toHaveCount(0);
  await expect(page.locator(".feedback-console")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/retry-en-desktop.png",
    fullPage: true,
  });
  await click(page, "help");
  await expect(page.getByRole("dialog")).toContainText(
    "Little tricks. Big possibilities.",
  );
  await page.screenshot({
    path: "docs/screenshots/help-en-desktop.png",
    fullPage: true,
  });
  await click(page, "group-practice");
  const practice = await code(page);
  expect(practice).not.toBe(original);
  await solve(page);
  let saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.best).toBe(0);
  expect(saved.practiceBest).toBe(3);
  expect(saved.completed[0].helpUsed).toBe(true);
  await click(page, "next");
  await click(page, "begin");
  await click(page, "help");
  await click(page, "group-practice");
  const previous = await code(page);
  await click(page, "fresh");
  expect(await code(page)).not.toBe(previous);
  await solve(page);
  saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.best).toBe(4);
});

test("touch keypad, language mid-recall, leading zeroes, duplicate submission and reset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await setup(page, "zh-TW");
  await click(page, "begin");
  expect(await code(page)).toBe("000");
  await click(page, "ready");
  await page.locator('[data-key="0"]').click();
  await click(page, "language");
  await expect(page.locator("#recall-input")).toHaveValue("0");
  await page.locator('[data-key="0"]').click();
  await page.locator('[data-key="0"]').click();
  await page.locator("#authorize-form").evaluate((form) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(
    page.getByText("First-try independent clear", { exact: true }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.completed).toHaveLength(1);
  expect(saved.best).toBe(3);
  await click(page, "settings");
  await click(page, "reset-dialog");
  await click(page, "close-dialog");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")).best,
    ),
  ).toBe(3);
  await click(page, "settings");
  await click(page, "reset-dialog");
  await click(page, "confirm-reset");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")).best,
    ),
  ).toBe(0);
});

test("real timer conceals code, modal pauses, refresh returns to safe briefing", async ({
  page,
}) => {
  await setup(page);
  await click(page, "begin");
  const initial = Number(await page.locator("#time-left").innerText());
  await click(page, "settings");
  await page.waitForTimeout(1300);
  await click(page, "close-dialog");
  expect(Number(await page.locator("#time-left").innerText())).toBe(initial);
  await expect(page.locator("#recall-input")).toBeVisible({ timeout: 7000 });
  await expect(page.getByTestId("visible-code")).toHaveCount(0);
  await page.reload();
  await click(page, "start");
  await expect(page.locator('[data-action="begin"]')).toBeVisible();
  await expect(page.locator("#recall-input")).toHaveCount(0);
});

test("free practice at 3 and 12 digits never advances campaign", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page);
  await click(page, "home");
  await click(page, "free-menu");
  for (const length of [3, 12]) {
    await page.locator("#practice-length").fill(String(length));
    await click(page, "start-free");
    expect((await code(page)).length).toBe(length);
    await solve(page);
    await click(page, "free-menu");
  }
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.best).toBe(12);
  expect(saved.completed).toHaveLength(0);
});

for (const locale of ["en", "zh-TW"]) {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    test(`responsive screenshots and accessible controls ${locale} ${viewport.width}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const size = viewport.width < 600 ? "mobile" : "desktop";
      await page.goto("/");
      if (locale === "zh-TW") await click(page, "language");
      await page.screenshot({
        path: `docs/screenshots/home-${locale}-${size}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await click(page, "how");
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await click(page, "start");
      await page.locator("#commander").fill("A1B");
      await page
        .locator("#commander-form")
        .evaluate((form) => form.requestSubmit());
      await expect(page.locator("#commander-error")).not.toBeEmpty();
      await page.locator("#commander").fill("sky");
      await page
        .locator("#commander-form")
        .evaluate((form) => form.requestSubmit());
      await click(page, "begin");
      await click(page, "help");
      await page.screenshot({
        path: `docs/screenshots/help-${locale}-${size}.png`,
        fullPage: true,
      });
      await click(page, "group-practice");
      const answer = await code(page);
      await click(page, "ready");
      await page.screenshot({
        path: `docs/screenshots/recall-${locale}-${size}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator("#recall-input").fill(answer);
      await page
        .locator("#authorize-form")
        .evaluate((form) => form.requestSubmit());
      await page.screenshot({
        path: `docs/screenshots/success-${locale}-${size}.png`,
        fullPage: true,
      });
      await click(page, "settings");
      await expect(page.getByRole("switch")).toHaveCount(2);
    });
  }
}

test("unavailable and malformed storage do not crash gameplay", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("little-star-launch-sequence-v1", "{bad"),
  );
  await setup(page);
  await click(page, "begin");
  await solve(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Unavailable");
    };
  });
  await page.reload();
  await click(page, "sound");
  await expect(page.locator(".storage-warning")).toBeVisible();
});

test("launch animation completes and skip is safe on repeated taps", async ({
  page,
}) => {
  await setup(page);
  await click(page, "begin");
  await solve(page);
  await expect(page.locator("#launch-countdown")).toContainText("3");
  await expect(page.locator('[data-action="next"]')).toBeVisible({
    timeout: 8500,
  });
  await click(page, "next");
  await click(page, "begin");
  await solve(page);
  await page.locator('[data-action="skip"]').evaluate((button) => {
    button.click();
    button.click();
  });
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.completed).toHaveLength(2);
});

test("background visibility pauses the live viewing timer", async ({
  page,
}) => {
  await setup(page);
  await click(page, "begin");
  const initial = await page.locator("#time-left").innerText();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(5400);
  await expect(page.getByTestId("visible-code")).toBeVisible();
  expect(await page.locator("#time-left").innerText()).toBe(initial);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#recall-input")).toBeVisible({ timeout: 6500 });
});

test("Traditional Chinese mobile seven-mission completion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page, "zh-TW");
  for (let i = 0; i < 7; i++) {
    await click(page, "begin");
    await solve(page);
    await click(page, i < 6 ? "next" : "certificate");
  }
  await expect(page.locator(".certificate")).toContainText(
    "太空任務指揮官證書",
  );
  await page.screenshot({
    path: "docs/screenshots/completion-zh-TW-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("native keyboard, same-code retry, and persisted sound/time preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page);
  await click(page, "settings");
  await page.getByRole("switch", { name: "Sound effects" }).click();
  await click(page, "extra-time");
  await click(page, "close-dialog");
  await click(page, "begin");
  expect(Number(await page.locator("#time-left").innerText())).toBe(10);
  const answer = await code(page);
  await click(page, "ready");
  await page.keyboard.type(answer === "999" ? "888" : "999");
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback-console")).toBeVisible();
  await click(page, "retry");
  await page.keyboard.type(answer);
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Mission completed — persistence pays off", { exact: true }),
  ).toBeVisible();
  let saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
  );
  expect(saved.best).toBe(0);
  expect(saved.completed[0].attempts).toBe(2);
  await page.reload();
  await click(page, "settings");
  for (const toggle of await page.getByRole("switch").all())
    await expect(toggle).toHaveAttribute("aria-checked", "true");
});
