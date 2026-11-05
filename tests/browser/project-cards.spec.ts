import { test, expect } from '@playwright/test';

for (const route of ['/', '/projects']) {
  test(`${route}: project details reveal on hover and keyboard focus`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const card = page.locator('#mailloop');
    const summary = card.getByRole('button', { name: 'Details for MailLoop', exact: true });
    await expect(summary).toHaveAttribute('aria-expanded', 'false');
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    await expect(card.locator('.project-footer')).toBeVisible();
    await expect(card.getByRole('button', { name: 'Next.js', exact: true })).toBeVisible();
    await card.hover();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', 'none');
    await page.mouse.move(0, 0);
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    await summary.focus();
    await expect(summary).toHaveAttribute('aria-expanded', 'true');
    await expect(card.getByRole('button', { name: /more technologies/ })).toBeVisible();
    await summary.press('Tab');
    await expect(card.getByRole('button', { name: 'Next.js', exact: true })).toBeFocused();
    await expect(card.locator('.project-description')).toBeVisible();
    await page.getByRole('button', { name: 'Search commands' }).focus();
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
  });
}

test('touch can open and close project details in both themes', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/projects');
  const card = page.locator('#mailloop');
  const summary = card.getByRole('button', { name: 'Details for MailLoop', exact: true });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    await summary.tap();
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.getByRole('button', { name: /Private repo/ })).toBeDisabled();
    await summary.tap();
    await expect(card.locator('.project-description')).toBeVisible();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.close();
});
