// Uses external Playwright test tooling; no runtime dependency is required.
// BASE_URL=http://localhost:3000 node --test tests/intro-browser.mjs
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium, firefox, webkit } from "playwright";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const storageKey = "czar-portfolio-intro-v1";
const browserType = { chromium, firefox, webkit }[process.env.BROWSER ?? "chromium"];
let browser;
before(async () => {
  browser = await browserType.launch({
    headless: true,
    ...(process.env.WEBKIT_EXECUTABLE_PATH ? { executablePath: process.env.WEBKIT_EXECUTABLE_PATH } : {}),
  });
});
after(async () => { await browser?.close(); });

async function ready(page) {
  await page.getByRole("dialog", { name: "Portfolio intro" }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="switch"]').disabled);
}

async function configure(page, preferences) {
  for (const [flag, enabled] of Object.entries(preferences)) {
    const control = page.getByRole("switch", { name: `--${flag}` });
    if ((await control.getAttribute("aria-checked") === "true") !== enabled) await control.click();
  }
}

async function launch(page) {
  // Launch must work even while a preference switch or color radio has focus.
  await page.keyboard.press("Enter");
  await page.getByRole("dialog", { name: "Portfolio intro" }).waitFor({ state: "detached" });
}

async function returnHome(page) {
  await page.getByRole("link", { name: "All projects", exact: true }).first().click();
  await page.waitForURL("**/projects");
  await page.goBack();
  await page.getByRole("button", { name: "Rebuild" }).waitFor();
}

test("first visit, focus containment, all launch choices, replay, refresh and new tab", { timeout: 90000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  try {
    await context.addInitScript(() => {
      window.introWrites = 0;
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "czar-portfolio-intro-v1") window.introWrites++;
        return setItem.call(this, key, value);
      };
      window.musicAttempts = 0;
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        window.musicAttempts++;
        return play.call(this);
      };
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${baseURL}/?intro-test=1#watch`);
    await ready(page);
    assert.equal(await page.evaluate(() => window.musicAttempts), 0);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), null);
    await page.keyboard.press("Control+k");
    assert.equal(await page.getByRole("dialog").count(), 1);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(i % 2 ? "Shift+Tab" : "Tab");
      assert(await page.evaluate(() => !!document.activeElement.closest('[aria-label="Portfolio intro"]')));
    }
    let launches = 0;
    for (const music of [false, true]) {
      for (const motion of [false, true]) {
        if (launches) {
          await page.getByRole("button", { name: "Rebuild" }).click();
          await ready(page);
          assert.equal(await page.getByRole("switch", { name: "--music" }).getAttribute("aria-checked"), "true");
        }
        await page.evaluate(() => {
          history.replaceState({ ...history.state, introTest: true }, "", `${location.pathname}${location.search}#watch`);
          scrollTo({ top: 700, behavior: "instant" });
        });
        await configure(page, { music, motion });
        await page.getByRole("radio", { name: "blue", exact: true }).click();
        await launch(page);
        assert.equal(await page.evaluate(() => scrollY), 0);
        assert.equal(await page.locator("html").getAttribute("data-accent"), null);
        assert.equal(new URL(page.url()).hash, "");
        assert.equal(new URL(page.url()).search, "?intro-test=1");
        assert.equal(await page.evaluate(() => history.state.introTest), true);
        assert.equal(await page.evaluate(() => window.introWrites), ++launches);
        assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey), {
          completed: true, color: "blue", motion,
        });
        if (motion) {
          await page.waitForFunction(() => document.querySelector("[data-swarm-tour]").dataset.mode === "auto");
          await page.keyboard.press("Escape");
          await page.waitForFunction(() => !document.documentElement.hasAttribute("data-swarm-active"));
        }
      }
    }
    await returnHome(page);
    await page.reload();
    await page.waitForFunction(() => document.querySelector("[data-swarm-tour]"));
    assert.equal(await page.locator("html").getAttribute("data-accent"), null);
    assert.equal(await page.getByRole("dialog", { name: "Portfolio intro" }).count(), 0);
    assert.equal(await page.evaluate(() => window.musicAttempts), 0);
    const tab = await context.newPage();
    await tab.goto(`${baseURL}/#watch`);
    await tab.waitForFunction(() => document.querySelector("[data-swarm-tour]"));
    assert.equal(await tab.locator("html").getAttribute("data-accent"), null);
    assert.equal(await tab.getByRole("dialog", { name: "Portfolio intro" }).count(), 0);
    assert.equal(new URL(tab.url()).hash, "#watch");
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

for (const mode of ["corrupt", "unavailable", "no canvas"]) {
  test(`${mode}: launch and return navigation remain usable`, { timeout: 45000 }, async () => {
    const context = await browser.newContext();
    try {
      await context.addInitScript(({ mode, storageKey }) => {
        if (mode === "corrupt") localStorage.setItem(storageKey, "{invalid");
        if (mode === "unavailable") {
          Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException("Storage unavailable", "SecurityError"); };
        }
        if (mode === "no canvas") HTMLCanvasElement.prototype.getContext = () => null;
      }, { mode, storageKey });
      await context.route("**/api/**", route => route.fulfill({ status: 503, body: "Unavailable" }));
      const page = await context.newPage();
      await page.goto(baseURL);
      await ready(page);
      await configure(page, { music: false, motion: mode === "no canvas" });
      await launch(page);
      await returnHome(page);
      assert.equal(await page.getByRole("dialog", { name: "Portfolio intro" }).count(), 0);
      assert.equal(await page.locator("html").getAttribute("data-terminal-intro"), null);
    } finally { await context.close(); }
  });
}
