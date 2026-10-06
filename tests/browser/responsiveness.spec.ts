import { test as base, expect, type Page } from '@playwright/test';

const routes = ['/', '/about', '/projects', '/stack', '/quotes', '/watch', '/missing-page'];
const widths = [320, 375, 379, 380, 381, 390, 639, 640, 641, 767, 768, 769, 1023, 1024, 1025, 1279, 1280, 1281, 1920];
const test = base.extend<{ appErrors: string[] }>({
  appErrors: [async ({ page, context }, use) => {
    const errors: string[] = [];
    const captureErrors = (currentPage: Page) => {
      currentPage.on('pageerror', error => errors.push(error.message));
      currentPage.on('response', response => {
        if (response.url().includes('/_next/static/') && response.status() >= 400) errors.push(`Missing app asset: ${response.url()}`);
      });
    };
    captureErrors(page);
    context.on('page', captureErrors);
    // Keep layout tests independent of third-party uptime. Failure paths are tested below.
    await context.route('https://api.github.com/**', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: route.request().url().includes('/repos?') ? Array.from({ length: 20 }, (_, i) => ({ name: `Repository-${i}`, description: 'Example', html_url: 'https://github.com/Czar-16', stargazers_count: i })) : { public_repos: 20 } }));
    await context.route('https://github-contributions-api.jogruber.de/**', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: { contributions: Array.from({ length: 371 }, (_, i) => ({ date: new Date(Date.UTC(2025, 9, i + 1)).toISOString().slice(0, 10), count: i % 5, level: i % 5 })) } }));
    await context.route('**/api/leetcode', route => route.fulfill({ status: 503, json: {} }));
    await context.route('**/api/x-posts', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: { posts: [] } }));
    await use(errors);
    context.off('page', captureErrors);
    expect(errors, 'uncaught application errors').toEqual([]);
  }, { auto: true }],
});

async function noOverflow(page: Page) {
  await expect(page.getByRole('navigation', { name: 'Main', exact: true })).toHaveCSS('display', 'flex');
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= width + 1) return [];
    return Array.from(document.querySelectorAll('body *')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > width + 1 && rect.width > 0 && getComputedStyle(el).position !== 'fixed';
    }).slice(0, 10).map(el => `${el.tagName}.${el.className}`);
  });
  expect(overflow, 'elements causing horizontal page overflow').toEqual([]);
}

for (const theme of ['dark', 'light']) {
  for (const width of widths) {
    test(`${theme}: all routes at ${width}px`, async ({ context }) => {
      await context.addInitScript(value => {
        if (location.origin === 'http://127.0.0.1:3100') localStorage.setItem('czar-theme', value);
      }, theme);
      // Each layout gets a fresh document; route transitions are exercised below.
      // This also avoids canceling Next's background prefetches with hard reloads.
      for (const route of routes) {
        const page = await context.newPage();
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[data-page-entry]')).toHaveCSS('opacity', '1');
        if (route === '/') {
          await expect(page.getByRole('list', { name: 'Featured repositories' })).toHaveAttribute('aria-busy', 'false');
          await expect(page.locator('article[aria-busy="true"]')).toHaveCount(0);
          await expect(page.getByRole('region', { name: /GitHub contribution calendar/ })).toBeVisible();
        }
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.getByRole('navigation', { name: 'Main', exact: true })).toBeVisible();
        await noOverflow(page);
        // Reveal content lower down and detect overflow after images/async cards settle.
        await page.locator('main').evaluate(el => el.scrollIntoView({ block: 'end' }));
        await noOverflow(page);
        if ([320, 768, 1280].includes(width)) {
          await page.evaluate(() => {
            // Load off-screen assets before a full-page visual review.
            document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
            window.scrollTo(0, 0);
          });
          await page.waitForFunction(() => Array.from(document.images).every(image => image.complete));
          await page.screenshot({ path: `test-results/review/${test.info().project.name}-${theme}-${width}-${route.replaceAll('/', '') || 'home'}.png`, fullPage: true });
        }
        await page.close();
      }
    });
  }
}

test('mobile menu navigation, history and resize release scroll lock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  await menu.click();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.locator('#mobile-menu').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL('/about');
  await expect(menu).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await menu.click();
  await page.goBack();
  await expect(menu).toBeVisible();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await menu.click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toBeVisible();
});

test('short landscape menus and command search remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 320 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.locator('#mobile-menu').getByRole('link', { name: 'Watch', exact: true }).click();
  await expect(page).toHaveURL('/watch');
  await page.getByRole('button', { name: /Search commands/ }).filter({ visible: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.fill('no-such-command');
  await expect(dialog.getByRole('status')).toHaveText('No matching commands.');
  await search.fill('Projects');
  await search.press('Enter');
  await expect(page).toHaveURL('/projects');
  await expect(dialog).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close command palette' }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await noOverflow(page);
});

test('theme persists and palette traps and restores keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Switch to light mode' }).filter({ visible: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const trigger = page.getByRole('button', { name: /Search commands/ }).filter({ visible: true });
  await trigger.click();
  const search = page.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.press('Shift+Tab');
  await expect(page.getByRole('option').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('terminal input, completion, history, and nested scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Skip terminal introduction' }).click();
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('he');
  await input.press('Tab');
  await expect(input).toHaveValue('help');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('help');
  const terminal = page.getByRole('region', { name: 'Interactive terminal' });
  await expect(terminal).toContainText('help');
  await input.press('Control+l');
  const calendar = page.getByRole('region', { name: /GitHub contribution calendar/ });
  await calendar.scrollIntoViewIfNeeded();
  await calendar.focus();
  await calendar.evaluate(el => { el.scrollLeft = 100; });
  await expect.poll(() => calendar.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await noOverflow(page);
});

test('quotes can be revealed with keyboard, categories changed, and back-to-top used', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/quotes', { waitUntil: 'domcontentloaded' });
  const categories = page.getByRole('group', { name: 'Quote categories' }).getByRole('button');
  await categories.first().click();
  const quote = page.getByRole('button', { name: /Uncover quote/ }).first();
  await quote.focus();
  await expect(page.locator('[data-revealed="true"]').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Copy quote/ }).first()).toBeVisible();
  await categories.nth(1).click();
  await expect(categories.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.getByRole('link', { name: 'Back to top' }).click();
  await expect(page.locator('#page-top')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test('technology popover supports keyboard dismissal and short viewports', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 320 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', { name: /more technologies for/ }).first();
  await expect(trigger).toBeVisible();
  await expect(async () => {
    await trigger.evaluate(element => { element.blur(); element.focus(); });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  const panel = page.getByRole('region', { name: /More technologies for/ });
  await expect(panel).toBeVisible();
  await panel.focus();
  const bounds = await panel.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('external failures and missing images leave usable fallbacks', async ({ page }) => {
  await page.route('https://github-contributions-api.jogruber.de/**', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: { contributions: 'invalid' } }));
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 503, json: {} }));
  await page.route('**/api/x-posts', route => route.fulfill({ status: 503, json: {} }));
  await page.route('**/_next/image?**', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('GitHub activity unavailable')).toBeVisible();
  await expect(page.getByText(/Couldn.t load repos right now/)).toBeVisible();
  await expect(page.getByRole('article', { name: 'LeetCode problem-solving statistics' })).toHaveAttribute('aria-busy', 'false');
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Screenshot', { exact: true }).first()).toBeVisible();
  await noOverflow(page);
});

test('touch controls work at 320px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  await page.locator('#mobile-menu').getByRole('link', { name: 'Quotes', exact: true }).tap();
  await expect(page).toHaveURL('/quotes');
  await page.getByRole('group', { name: 'Quote categories' }).getByRole('button').first().tap();
  await page.locator('[data-quote-id]').first().tap();
  await expect(page.locator('[data-revealed="true"]').first()).toBeVisible();
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', { name: /more technologies for/ }).first();
  await trigger.tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await noOverflow(page);
  expect(errors).toEqual([]);
  await context.close();
});

test('200% desktop zoom reflow keeps navigation and pages usable', async ({ browser }) => {
  // A 1280×900 desktop at 200% browser zoom exposes a 640×450 CSS viewport.
  // Emulate that reflow and density; Playwright cannot set native browser zoom.
  const context = await browser.newContext({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeVisible();
    await noOverflow(page);
  }
  await context.close();
});

test('every navigation destination works on mobile and desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (const [label, route] of [['Projects', '/projects'], ['Stack', '/stack'], ['Watch', '/watch'], ['Quotes', '/quotes'], ['About', '/about'], ['Home', '/']]) {
      if (width < 1280) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      const navigation = width < 1280 ? page.locator('#mobile-menu') : page.getByRole('navigation', { name: 'Main', exact: true });
      await navigation.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    }
  }
});

test('loading services time out and empty data remains usable', async ({ page }) => {
  // Deliberately leave these requests pending to exercise the client deadline.
  await page.route('https://api.github.com/**', () => {});
  await page.route('https://github-contributions-api.jogruber.de/**', () => {});
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const repositories = page.getByRole('list', { name: 'Featured repositories' });
  await expect(repositories).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status', { name: 'Loading GitHub contributions' })).toBeVisible();
  await expect(repositories).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByText('GitHub activity unavailable')).toBeVisible();
  await page.unroute('https://api.github.com/**');
  await page.unroute('https://github-contributions-api.jogruber.de/**');
  await page.route('https://api.github.com/**', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: route.request().url().includes('/repos?') ? [] : { public_repos: 0 } }));
  await page.route('https://github-contributions-api.jogruber.de/**', route => route.fulfill({ headers: { "access-control-allow-origin": "*" }, json: { contributions: [] } }));
  await page.reload();
  await expect(page.getByText('No public repositories yet')).toBeVisible();
  await expect(page.getByText('GitHub activity unavailable')).toBeVisible();
  await noOverflow(page);
});

test('normal motion and changing reduced-motion preference preserve controls', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await page.getByRole('textbox', { name: 'Terminal command' }).fill('help');
  await page.getByRole('textbox', { name: 'Terminal command' }).press('Enter');
  await noOverflow(page);
});

test('copy controls report success and denied clipboard access within mobile bounds', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } }));
  await expect(async () => {
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByText('Copied to clipboard.', { exact: true })).toHaveCount(1, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } }));
  await page.getByRole('button', { name: 'Copy email' }).click();
  const error = page.getByText("Couldn't copy. Select the text to copy it manually.", { exact: true });
  await expect(error).toBeVisible();
  const bounds = await error.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  await page.goto('/quotes', { waitUntil: 'domcontentloaded' });
  await page.getByRole('group', { name: 'Quote categories' }).getByRole('button').first().click();
  await page.getByRole('button', { name: /Uncover quote/ }).first().focus();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } }));
  await page.getByRole('button', { name: /Copy quote/ }).first().click();
  await expect(error).toBeVisible();
  const quoteBounds = await error.boundingBox();
  expect(quoteBounds!.x).toBeGreaterThanOrEqual(0);
  expect(quoteBounds!.x + quoteBounds!.width).toBeLessThanOrEqual(320);
  await noOverflow(page);
});
