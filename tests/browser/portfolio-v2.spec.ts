import { test, expect } from '@playwright/test';

test('dark mode is permanent, including for saved light preferences', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('czar-theme', 'light'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: /Switch to .* mode/ })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

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

test('homepage preserves previews, section order, and blank banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.profile-banner')).toBeEmpty();
  await expect(page.locator('#watch .watch-preview a')).toHaveCount(6);
  await expect(page.locator('#quotes blockquote')).toHaveCount(3);
  expect(await page.locator('main section[id]').evaluateAll(elements => elements.map(el => el.id))).toEqual([
    'profile', 'projects', 'github', 'leetcode', 'tech-stack', 'posts', 'spotify', 'watch', 'quotes', 'terminal', 'contact',
  ]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('navigation', { name: 'Section index' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Section index' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL('/#contact');
});
