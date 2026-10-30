import { test, expect, type Page } from '@playwright/test';

async function trackAudio(page: Page, fail = false) {
  await page.addInitScript(({ fail }) => {
    const state = { starts: 0, contexts: 0 };
    Object.assign(window, { interactionAudio: state });
    const OriginalAudioContext = window.AudioContext;
    if (!OriginalAudioContext) return;
    window.AudioContext = class extends OriginalAudioContext {
      constructor() {
        if (fail) throw new Error('Audio unavailable');
        super();
        state.contexts++;
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start.bind(source);
        source.start = (...args: Parameters<typeof source.start>) => {
          state.starts++;
          return start(...args);
        };
        return source;
      }
    };
  }, { fail });
}

const audioState = (page: Page) => page.evaluate(() =>
  (window as unknown as { interactionAudio: { starts: number; contexts: number } }).interactionAudio);

async function openPortfolio(page: Page) {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Mute click sounds' })).toBeVisible();
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('width', '1366');
}

test('sparks cover blank space, expire, and respect motion preferences', async ({ page }) => {
  await trackAudio(page);
  await openPortfolio(page);
  const canvas = page.locator('[data-click-sparks]');
  await page.mouse.click(8, 300);
  await expect(canvas).toHaveAttribute('data-active', 'true');
  await expect.poll(async () => (await audioState(page)).starts).toBe(0);
  await expect(canvas).toHaveAttribute('data-active', 'false');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.click(8, 300);
  await expect(canvas).toHaveAttribute('data-active', 'false');
  await page.getByRole('button', { name: 'Search commands' }).click();
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  await expect(canvas).toHaveAttribute('data-active', 'false');
});

test('one sound per nested button or link activation, keyboard activation has no sparks', async ({ page }) => {
  await trackAudio(page);
  await openPortfolio(page);
  const search = page.getByRole('button', { name: 'Search commands' });
  await search.locator('svg').click();
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  await page.getByRole('combobox').fill('about');
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  await page.getByRole('combobox').press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBe(2);
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'false');
  await search.focus();
  await search.press('Enter');
  await expect.poll(async () => (await audioState(page)).starts).toBe(3);
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'false');
  await page.getByRole('button', { name: 'Close command palette' }).click();
  await page.getByRole('navigation', { name: 'Main', exact: true }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL('/projects');
  await expect.poll(async () => (await audioState(page)).starts).toBe(5);
  expect((await audioState(page)).contexts).toBe(1);
});

test('mute is silent, persists across routes and reloads, and enabling previews once', async ({ page }) => {
  await trackAudio(page);
  await openPortfolio(page);
  await page.getByRole('button', { name: 'Mute click sounds' }).click();
  await expect(page.getByRole('button', { name: 'Enable click sounds' })).toHaveAttribute('aria-pressed', 'false');
  expect((await audioState(page)).starts).toBe(0);
  await page.getByRole('navigation', { name: 'Main', exact: true }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL('/projects');
  expect((await audioState(page)).starts).toBe(0);
  await page.reload();
  await page.getByRole('button', { name: 'Enable click sounds' }).click();
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  await expect(page.getByRole('button', { name: 'Mute click sounds' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('czar-sound'))).toBe('on');
});

test('actionable cards and nested controls sound once; disabled controls stay silent', async ({ page }) => {
  await trackAudio(page);
  await page.goto('/quotes');
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('width', '1280');
  await page.getByRole('group', { name: 'Quote categories' }).getByRole('button').first().click();
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  const card = page.locator('[data-quote-id]').first();
  await card.click({ position: { x: 25, y: 150 } });
  await expect.poll(async () => (await audioState(page)).starts).toBe(2);
  await card.getByRole('button', { name: /Revealed quote/ }).click();
  await expect.poll(async () => (await audioState(page)).starts).toBe(3);
  // Exercise exclusions with real DOM activations, including synthetic clicks
  // on aria-disabled controls which native HTML does not suppress itself.
  await page.evaluate(() => {
    for (const attributes of ['disabled', 'aria-disabled="true"', 'data-click-sound="off"']) {
      const region = document.createElement('div');
      region.innerHTML = `<button ${attributes}>Unavailable</button>`;
      document.body.append(region);
      region.querySelector('button')!.click();
      region.remove();
    }
  });
  expect((await audioState(page)).starts).toBe(3);
});

test('audio failure and unavailable storage do not block controls', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await trackAudio(page, true);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  });
  await openPortfolio(page);
  await page.getByRole('button', { name: 'Search commands' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Mute click sounds' }).click();
  await expect(page.getByRole('button', { name: 'Enable click sounds' })).toBeVisible();
  await page.getByRole('button', { name: 'Enable click sounds' }).click();
  await expect(page.getByRole('button', { name: 'Mute click sounds' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile taps burst once, swipes do not burst, and navigation fits at 320px', async ({ browser, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefox does not support Playwright touch emulation');
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 320, height: 750 } });
  const page = await context.newPage();
  await trackAudio(page);
  await page.goto('http://127.0.0.1:3100/about');
  const sound = page.getByRole('button', { name: 'Mute click sounds' });
  await expect(sound).toBeVisible();
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('width', '320');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.touchscreen.tap(8, 300);
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'true');
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'false');
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  await expect.poll(async () => (await audioState(page)).starts).toBe(1);
  await page.getByRole('button', { name: 'Close menu', exact: true }).tap();
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'false');
  await page.dispatchEvent('main', 'pointerdown', { pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, clientX: 100, clientY: 400 });
  await page.dispatchEvent('main', 'pointermove', { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 100, clientY: 200 });
  await page.dispatchEvent('main', 'click', { detail: 1, button: 0, clientX: 100, clientY: 200 });
  await expect(page.locator('[data-click-sparks]')).toHaveAttribute('data-active', 'false');
  expect((await audioState(page)).starts).toBe(2);
  await context.close();
});
