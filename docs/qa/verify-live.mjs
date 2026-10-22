import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const address = process.argv[2];
assert.ok(address, "Supply the deployed HTTPS site URL.");
const site = new URL(address);
assert.equal(site.protocol, "https:");
assert.ok(site.pathname.endsWith("/"), "The site URL must end with a slash.");
const proxyAddress = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
let proxy;
if (proxyAddress) {
  const url = new URL(proxyAddress);
  proxy = { server: `${url.protocol}//${url.host}` };
  if (url.username) proxy.username = decodeURIComponent(url.username);
  if (url.password) proxy.password = decodeURIComponent(url.password);
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
  ...(proxy ? { proxy } : {}),
});
const report = {
  url: site.href,
  verifiedAt: new Date().toISOString(),
  browser: browser.version(),
  assetChecks: [],
  playthroughs: [],
};
const hash = (body) => createHash("sha256").update(body).digest("hex");
const click = (page, action) =>
  page.locator(`[data-action="${action}"]`).first().click();
await mkdir("docs/screenshots", { recursive: true });
await mkdir("docs/qa", { recursive: true });

try {
  for (const locale of ["en", "zh-TW"]) {
    const mobile = locale === "zh-TW";
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    const responses = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("requestfailed", (request) =>
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText,
      }),
    );
    page.on("response", (response) => {
      responses.push(response);
      if (response.status() >= 400)
        errors.push(`HTTP ${response.status()} ${response.url()}`);
    });
    const initial = await page.goto(site.href, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    assert.equal(initial.status(), 200);
    await page.locator('[data-action="start"]').waitFor();
    assert.equal(
      await page.title(),
      "Launch Sequence · Little Star Space Agency",
    );
    if (mobile) await click(page, "language");
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `docs/screenshots/live-home-${locale}.png`,
      fullPage: true,
    });

    if (!mobile) {
      for (const response of responses) {
        const url = new URL(response.url());
        if (
          url.origin !== site.origin ||
          !url.pathname.startsWith(site.pathname)
        )
          continue;
        const relative =
          url.pathname.slice(site.pathname.length) || "index.html";
        if (
          relative !== "index.html" &&
          !/^assets\/[^/]+\.(js|css)$/.test(relative)
        )
          continue;
        const remoteHash = hash(await response.body());
        const localHash = hash(await readFile(`dist/${relative}`));
        assert.equal(
          remoteHash,
          localHash,
          `${relative} differs from the validated build`,
        );
        report.assetChecks.push({
          path: relative,
          status: response.status(),
          sha256: remoteHash,
          matchesLocalBuild: true,
        });
      }
      assert.equal(
        report.assetChecks.length,
        3,
        "Verify HTML, JavaScript, and CSS.",
      );
    }

    await click(page, "start");
    await page.locator("#commander").fill("sky");
    await page.locator("#commander-form button[type=submit]").click();
    for (let i = 0; i < 7; i++) {
      await click(page, "begin");
      const answer = (
        await page.getByTestId("visible-code").innerText()
      ).replace(/[^0-9]/g, "");
      assert.equal(answer.length, i + 3);
      await click(page, "ready");
      assert.equal(await page.getByTestId("visible-code").count(), 0);
      if (!mobile && i === 0) {
        await page
          .locator("#recall-input")
          .fill(answer === "999" ? "888" : "999");
        await page.locator("#authorize-form button[type=submit]").click();
        await page.locator(".feedback-console").waitFor();
        assert.equal(await page.getByTestId("visible-code").count(), 0);
        await click(page, "retry");
      }
      await page.locator("#recall-input").fill(answer);
      await page.locator("#authorize-form button[type=submit]").click();
      await page.locator(".success-result").waitFor();
      await click(page, i < 6 ? "next" : "certificate");
    }
    await page.locator(".certificate").waitFor();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
    );
    assert.equal(saved.completed.length, 7);
    assert.equal(saved.best, 9);
    assert.equal(saved.commander, "SKY");
    assert.equal(saved.lang, locale);
    if (!mobile) {
      assert.equal(saved.completed[0].attempts, 2);
      assert.equal(saved.completed[0].firstAttemptCorrect, false);
    }
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `docs/screenshots/live-completion-${locale}.png`,
      fullPage: true,
    });
    await page.reload({ waitUntil: "networkidle" });
    await click(page, "start");
    await page.locator(".certificate").waitFor();
    await click(page, "home");
    await click(page, "free-menu");
    await page.locator("#practice-length").fill("12");
    await click(page, "start-free");
    const practice = (
      await page.getByTestId("visible-code").innerText()
    ).replace(/[^0-9]/g, "");
    assert.equal(practice.length, 12);
    await click(page, "ready");
    await page.locator("#recall-input").fill(practice);
    await page.locator("#authorize-form button[type=submit]").click();
    await page.locator(".success-result").waitFor();
    const final = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("little-star-launch-sequence-v1")),
    );
    assert.equal(final.best, 12);
    assert.equal(final.completed.length, 7);
    assert.deepEqual(failedRequests, []);
    assert.deepEqual(errors, []);
    report.playthroughs.push({
      locale,
      viewport: page.viewportSize(),
      missionsCompleted: 7,
      certificate: true,
      restoredAfterReload: true,
      freePracticeDigits: 12,
      independentBest: final.best,
      wrongAnswerAndRetry: !mobile,
      horizontalOverflow: false,
      runtimeErrors: errors,
      failedRequests,
    });
    await context.close();
  }
  report.status = "passed";
  await writeFile(
    "docs/qa/live-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
