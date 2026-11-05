import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('czar-swarm-seen', '2'); } catch { /* Storage-denied cases use the normal site. */ } });
});
import { projects } from '../../data/projects';

for (const route of ['/', '/projects']) {
  test(`${route}: project details reveal on hover and keyboard focus`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const card = page.locator('#mailloop');
    const summary = card.getByRole('link', { name: 'MailLoop on GitHub', exact: true });
    await expect(card).toHaveAttribute('data-details-open', 'false');
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    await expect(card.locator('.project-footer')).toBeVisible();
    await card.hover();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', 'none');
    await page.mouse.move(0, 0);
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
    await summary.focus();
    await expect(card).toHaveAttribute('data-details-open', 'true');
    await summary.press('Tab');
    await expect(card.getByRole('button', { name: 'Next.js', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Search commands' }).focus();
    await expect(card.locator('.project-description')).toHaveCSS('-webkit-line-clamp', '2');
  });

  test(`${route}: every project card prefers its live destination and falls back to GitHub`, async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.route(/^https:\/\//, route => route.fulfill({ contentType: 'text/html', body: '<title>Project destination</title>' }));
    await page.goto(route);
    const cards = page.locator('.project-card');
    for (const card of await cards.all()) {
      const slug = await card.getAttribute('id');
      const data = projects.find(project => project.slug === slug)!;
      const destination = data.links.find(link => link.label === 'Live' && !link.private)
        ?? data.links.find(link => link.label === 'GitHub') ?? data.links[0];
      const link = card.locator('.project-summary');
      await expect(link).toHaveAttribute('href', destination.href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const popupPromise = page.waitForEvent('popup');
      await link.click({ position: { x: 20, y: 20 } });
      const popup = await popupPromise;
      await popup.waitForURL(destination.href);
      await popup.close();
    }
  });
}

test('card body and keyboard open its destination while technology controls remain independent', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await context.route(/^https:\/\//, route => route.fulfill({ contentType: 'text/html', body: '<title>Project destination</title>' }));
  await page.goto('/projects');
  const card = page.locator('#designarena');
  await card.locator('.project-summary').focus();
  await expect(card).toHaveAttribute('data-details-open', 'true');
  for (const activate of [
    async () => {
      const description = card.locator('.project-description');
      await description.scrollIntoViewIfNeeded();
      await expect(description).toBeVisible();
      const box = await description.boundingBox();
      await page.mouse.click(box!.x + 10, box!.y + 10);
    },
    () => card.locator('.project-summary').press('Enter'),
    () => card.click({ position: { x: 20, y: 3 } }),
  ]) {
    const popupPromise = page.waitForEvent('popup');
    await activate();
    const popup = await popupPromise;
    await popup.waitForURL('https://design-arena-omega.vercel.app/');
    await popup.close();
  }
  await card.getByRole('button', { name: 'Next.js', exact: true }).click();
  expect(context.pages()).toHaveLength(1);
  await expect(card.getByRole('link', { name: 'DesignArena on GitHub' })).toHaveAttribute('href', 'https://github.com/Czar-16/DesignArena');
});

test('touch opens the card destination in both themes', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  await context.route(/^https:\/\//, route => route.fulfill({ contentType: 'text/html', body: '<title>Project destination</title>' }));
  const page = await context.newPage();
  await page.goto('/projects');
  const card = page.locator('#mailloop');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    await expect(card.getByRole('button', { name: /Private repo/ })).toBeDisabled();
    const popupPromise = page.waitForEvent('popup');
    await card.locator('.project-summary').tap();
    const popup = await popupPromise;
    await popup.waitForURL('https://github.com/Czar-16/mailloop');
    await popup.close();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.close();
});
