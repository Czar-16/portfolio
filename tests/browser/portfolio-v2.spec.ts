import { test, expect } from '@playwright/test';
import { watchItems } from '../../data/watch';

test('saved theme persists across reloads and navigation', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('czar-theme')) localStorage.setItem('czar-theme', 'light'); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`system ${colorScheme} works with unavailable storage`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage denied'); } }));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    await page.getByRole('button', { name: `Switch to ${colorScheme === 'light' ? 'dark' : 'light'} mode` }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme === 'light' ? 'dark' : 'light');
  });
}

test('closing quote rotates every six seconds and pauses in hidden documents', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const start = new Date('2026-11-05T00:00:00Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start);
  await page.goto('/');
  const quote = page.locator('[data-closing-quote]');
  await expect(page.locator('.closing-quote')).toHaveAttribute('data-quote-rotating', 'true');
  await expect(quote).toHaveAttribute('data-closing-quote', '1');
  await page.clock.fastForward(5999);
  await expect(quote).toHaveAttribute('data-closing-quote', '1');
  await page.clock.fastForward(1);
  await expect(quote).toHaveAttribute('data-closing-quote', '2');
  await expect(quote).toHaveCSS('animation-name', 'none');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.closing-quote')).toHaveAttribute('data-quote-rotating', 'false');
  await page.clock.fastForward(12000);
  await expect(quote).toHaveAttribute('data-closing-quote', '2');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.closing-quote')).toHaveAttribute('data-quote-rotating', 'true');
  await page.clock.fastForward(6000);
  await expect(quote).toHaveAttribute('data-closing-quote', '3');
});

test('homepage preserves watch and closing quote without a quotes preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.profile-banner')).toHaveCount(0);
  const watch = page.getByRole('region', { name: 'Watch recommendations' });
  await expect(watch.getByRole('link')).toHaveCount(watchItems.length);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await watch.scrollIntoViewIfNeeded();
    await watch.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await expect(watch.getByRole('link').last()).toBeInViewport({ ratio: 1 });
  }
  await expect(watch.getByRole('link').last()).toHaveAttribute('href', `/watch#${watchItems.at(-1)!.slug}`);
  await expect(page.locator('#quotes')).toHaveCount(0);
  await expect(page.locator('.closing-quote')).toBeVisible();
  expect(await page.locator('main section[id]').evaluateAll(elements => elements.map(el => el.id))).toEqual([
    'profile', 'projects', 'github', 'leetcode', 'tech-stack', 'posts', 'spotify', 'watch', 'terminal', 'contact',
  ]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('navigation', { name: 'Section index' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Section index' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL('/#contact');
});

test('theme follows system changes until a preference is selected', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

for (const theme of ['light', 'dark']) {
  test(`${theme} landscape keeps categories, dialogs, and projects in bounds`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('czar-theme', value), theme);
    await page.setViewportSize({ width: 667, height: 320 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['/', '/about', '/projects', '/stack', '/quotes', '/watch']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Search commands' }).click();
      const input = page.getByRole('combobox');
      await expect(input).toBeInViewport();
      await input.press('Escape');
    }
  });
}

for (const width of [320, 1440]) {
  test(`profile starts below the toolbar and respects motion preferences at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const intro = page.locator('.profile-intro');
    await expect(intro).toBeInViewport();
    const toolbar = await page.locator('.site-header').boundingBox();
    const profile = await intro.boundingBox();
    expect(profile!.y - (toolbar!.y + toolbar!.height)).toBeGreaterThanOrEqual(0);
    expect(profile!.y - (toolbar!.y + toolbar!.height)).toBeLessThanOrEqual(32);
    await expect(intro).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(intro).toHaveCSS('animation-name', 'profile-bounce');
  });
}
