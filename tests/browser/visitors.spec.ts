import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('czar-swarm-seen', '2'); } catch { /* Storage-denied cases use the normal site. */ } });
});

for (const theme of ['dark', 'light']) {
  test(`homepage counter matches ${theme} theme and fits a narrow screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.addInitScript(value => localStorage.setItem('czar-theme', value), theme);
    await page.route('**/api/visitors', route => route.fulfill({ json: { count: 1234 } }));
    await page.goto('/');
    const counter = page.getByRole('region', { name: 'Portfolio visitors' });
    await expect(counter).toContainText('1,234 visitors have been here');
    await counter.scrollIntoViewIfNeeded();
    const box = await counter.locator('svg').evaluate(el => ({
      color: getComputedStyle(el).color,
      filter: getComputedStyle(el).filter,
      animation: getComputedStyle(el.querySelector('[data-eye-aperture]')!).animationName,
    }));
    expect(box.color).toBe(theme === 'dark' ? 'rgb(229, 229, 229)' : 'rgb(38, 38, 38)');
    expect(box.filter).toBe('none');
    expect(box.animation).not.toBe('none');
    const blink = await counter.locator('[data-eye-aperture]').evaluate(el => {
      const animation = el.getAnimations()[0];
      animation.pause();
      animation.currentTime = 3679;
      const closed = new DOMMatrixReadOnly(getComputedStyle(el).transform).m22;
      animation.currentTime = 3822;
      const open = new DOMMatrixReadOnly(getComputedStyle(el).transform).m22;
      animation.play();
      return { closed, open };
    });
    expect(blink.closed).toBeLessThan(0.1);
    expect(blink.open).toBeCloseTo(1);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(counter.locator('[data-eye-aperture]')).toHaveCSS('animation-play-state', 'paused');
    await page.evaluate(() => {
      Reflect.deleteProperty(document, 'hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(counter.locator('[data-eye-aperture]')).toHaveCSS('animation-play-state', 'running');
    const bounds = await counter.locator('div').boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await page.screenshot({ path: `test-results/review/visitors-${theme}.png` });
    await page.goto('/about');
    await expect(page.getByRole('region', { name: 'Portfolio visitors' })).toHaveCount(0);
  });
}

test('reduced motion leaves a static eye and unavailable storage has an honest fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/visitors', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.goto('/');
  const counter = page.getByRole('region', { name: 'Portfolio visitors' });
  await expect(counter).toContainText('Visitor count unavailable');
  await expect(counter.locator('[data-eye-aperture]')).toHaveCSS('animation-name', 'none');
});

test('loading reserves the counter and the browser identity survives a reload', async ({ page }) => {
  const identities: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/visitors', async route => {
    identities.push(route.request().postDataJSON().visitorId);
    await gate;
    await route.fulfill({ json: { count: 1 } });
  });
  await page.goto('/');
  const counter = page.getByRole('region', { name: 'Portfolio visitors' });
  await expect(counter.locator('p')).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(counter).toContainText('1 visitor has been here');
  await page.reload();
  await expect(counter).toContainText('1 visitor has been here');
  expect(identities.length).toBeGreaterThanOrEqual(2);
  expect(new Set(identities).size).toBe(1);
});

test('eye follows the pointer, pauses offscreen, and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/visitors', route => route.fulfill({ json: { count: 42 } }));
  await page.goto('/');
  const eye = page.locator('[data-visitor-eye]');
  await expect(eye).toHaveAttribute('data-paused', 'true');
  await eye.scrollIntoViewIfNeeded();
  await expect(eye).toHaveAttribute('data-paused', 'false');
  const bounds = (await eye.boundingBox())!;
  const xGaze = () => eye.evaluate(el => parseFloat((el as SVGSVGElement).style.getPropertyValue('--gaze-x')));
  await page.mouse.move(bounds.x + 200, bounds.y + 15);
  await expect.poll(xGaze).toBeGreaterThan(0);
  await page.mouse.move(bounds.x - 200, bounds.y + 15);
  await expect.poll(xGaze).toBeLessThan(0);
  await expect(eye).toHaveAttribute('data-tracking', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(eye.locator('[data-eye-aperture]')).toHaveCSS('animation-name', 'none');
  await expect.poll(xGaze).toBe(0);
  await page.mouse.move(bounds.x + 200, bounds.y + 15);
  expect(await xGaze()).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(eye).toHaveAttribute('data-paused', 'true');
  await expect(eye.locator('[data-eye-aperture]')).toHaveCSS('animation-play-state', 'paused');
});
