import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const tour = (page: Page) => page.locator('[data-swarm-tour]');
const pending = (page: Page) => page.locator('[data-swarm-pending]');
async function start(page: Page) {
  await page.goto('/');
  await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
  await expect(page.getByRole('button', { name: 'Skip animation' })).toBeVisible();
}
async function settled(page: Page) {
  await expect(pending(page)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-swarm-active');
  await expect(page.getByRole('button', { name: 'Skip animation' })).toBeHidden();
}
async function jump(page: Page, section: string) {
  await page.mouse.move(10, 400);
  await page.locator(section).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  // Let existing project-card hover transitions settle before checking Replay.
  await page.waitForTimeout(500);
}
test('automatic playback completes each viewport and reaches the closing section', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await start(page);
  await page.waitForTimeout(1800);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 12000 }).toBeGreaterThan(100);
  await expect(page.locator('#profile [data-swarm-pending]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Skip animation' })).toBeHidden({ timeout: 80000 });
  await settled(page);
  await expect(page.locator('.closing-quote')).toBeInViewport();
  await expect(tour(page).locator('canvas')).toBeHidden();
  expect(await tour(page).locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some(value => value !== 0))).toBe(false);
  await page.waitForTimeout(600);
  await expect(tour(page).locator('canvas')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeLessThan(5);
  expect(errors).toEqual([]);
});

for (const input of ['wheel', 'keys', 'scrollbar'] as const) {
  test(`${input} cannot interfere with automatic playback`, async ({ page }) => {
    await start(page);
    if (input === 'wheel') { await page.mouse.move(10, 400); await page.mouse.wheel(0, 1500); }
    if (input === 'keys') { await page.keyboard.press('PageDown'); await page.keyboard.press('End'); await page.keyboard.press('Space'); }
    if (input === 'scrollbar') { await page.mouse.move(1438, 100); await page.mouse.down(); await page.mouse.move(1438, 700); await page.mouse.up(); }
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
    expect(await page.locator('html').evaluate(element => getComputedStyle(element).overflowY)).toBe('hidden');
    await page.keyboard.press('Escape'); await settled(page);
    await page.mouse.move(10, 400); await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  });
}

for (const method of ['button', 'Escape'] as const) {
  test(`${method} reveals everything without moving the page; Replay starts at the current viewport`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('czar-pet', 'cat'));
    await start(page);
    const position = await page.evaluate(() => scrollY);
    if (method === 'button') await page.getByRole('button', { name: 'Skip animation' }).click();
    else await page.keyboard.press('Escape');
    await settled(page);
    expect(await page.evaluate(() => scrollY)).toBe(position);
    expect(await page.evaluate(() => localStorage.getItem('czar-pet'))).toBe('cat');
    await jump(page, '#tech-stack');
    const replayPosition = await page.evaluate(() => scrollY);
    await page.getByRole('button', { name: 'Replay animation' }).click();
    await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => scrollY)).toBe(replayPosition);
    await page.keyboard.press('Escape'); await settled(page);
    await page.reload(); await settled(page);
    expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBe('2');
  });
}

test('focus reveals unfinished content immediately and leaves the real control focusable', async ({ page }) => {
  await start(page);
  const link = page.locator('#contact a').first();
  await link.focus();
  await expect(link).toBeFocused();
  expect(await link.evaluate(element => element.closest('[data-swarm-pending]'))).toBeNull();
  await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
  await page.keyboard.press('Escape'); await settled(page);
});

for (const change of ['resize', 'reduced motion', 'navigation'] as const) {
  test(`${change} removes all masks and cleans up playback`, async ({ page }) => {
    await start(page);
    if (change === 'resize') await page.setViewportSize({ width: 1300, height: 850 });
    if (change === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (change === 'navigation') {
      await page.locator('#projects .section-heading a').evaluate((link: HTMLAnchorElement) => link.click());
      await expect(page).toHaveURL('/projects'); await expect(tour(page)).toHaveCount(0);
    } else await settled(page);
    await expect(pending(page)).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-swarm-active');
  });
}

for (const pause of ['hidden tab', 'modal lock'] as const) {
  test(`${pause} pauses movement and reveal progress`, async ({ page }) => {
    await start(page);
    await page.evaluate(pause => {
      if (pause === 'hidden tab') { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); }
      else document.documentElement.style.overflowY = 'hidden';
    }, pause);
    await page.waitForTimeout(100);
    const clips = await pending(page).evaluateAll(elements => elements.map(element => element.getAttribute('style')));
    await page.waitForTimeout(2000);
    expect(await pending(page).evaluateAll(elements => elements.map(element => element.getAttribute('style')))).toEqual(clips);
    await page.evaluate(pause => {
      if (pause === 'hidden tab') { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); }
      else document.documentElement.style.removeProperty('overflow-y');
    }, pause);
    await expect(page.locator('#profile [data-swarm-pending]')).toHaveCount(0, { timeout: 8000 });
  });
}

for (const bypass of ['reduced motion', 'anchor', 'storage read', 'storage write', 'seen'] as const) {
  test(`${bypass} bypass keeps normal content`, async ({ page }) => {
    if (bypass === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    if (bypass === 'storage read') await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Blocked'); }; });
    if (bypass === 'storage write') await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Blocked'); }; });
    if (bypass === 'seen') await page.addInitScript(() => localStorage.setItem('czar-swarm-seen', '2'));
    await page.goto(bypass === 'anchor' ? '/#contact' : '/');
    await page.waitForTimeout(600); await settled(page);
    if (bypass === 'seen' || bypass === 'anchor') await expect(page.getByRole('button', { name: 'Replay animation' })).toBeVisible();
  });
}

test('version 1 visitors get the redesigned playback once', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('migrated')) { localStorage.setItem('czar-swarm-seen', '1'); sessionStorage.setItem('migrated', 'yes'); } });
  await start(page);
  expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBe('2');
  await page.reload(); await page.waitForTimeout(600); await settled(page);
});

test('another route does not consume the first homepage visit', async ({ page }) => {
  await page.goto('/about');
  expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBeNull();
  await page.getByRole('link', { name: 'Czar16.', exact: true }).click();
  await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
});

test('touch devices bypass without consuming the visit', async ({ browser, browserName, baseURL }) => {
  test.skip(browserName === 'firefox', 'Firefox does not emulate touch devices');
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL!); await page.waitForTimeout(600); await settled(page);
  expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBeNull();
  await context.close();
});

for (const theme of ['light', 'dark'] as const) {
  test(`stable layout and controls in ${theme} theme`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem('czar-theme', theme), theme);
    await start(page);
    const before = await page.locator('#profile').boundingBox();
    await page.screenshot({ path: `test-results/swarm-${theme}.png` });
    await page.keyboard.press('Escape'); await settled(page);
    expect(await page.locator('#profile').boundingBox()).toEqual(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  });
}

test('restored history position bypasses without consuming a visit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  await page.evaluate(() => scrollTo(0, 600)); await page.goto('/about');
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.goBack();
  await page.waitForTimeout(600); await settled(page);
  expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBeNull();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('focus before initialization keeps controls available without playback', async ({ page }) => {
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.querySelector<HTMLButtonElement>('button[aria-label="Search commands"]')?.focus(), { once: true }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Search commands', exact: true })).toBeFocused();
  await page.waitForTimeout(600); await settled(page);
  expect(await page.evaluate(() => localStorage.getItem('czar-swarm-seen'))).toBeNull();
});

for (const failure of ['null canvas', 'throwing canvas', 'drawing failure'] as const) {
  test(`${failure} leaves all content revealed and scrolling unlocked`, async ({ page }) => {
    await page.addInitScript(failure => {
      if (failure === 'drawing failure') {
        const original = CanvasRenderingContext2D.prototype.stroke;
        CanvasRenderingContext2D.prototype.stroke = function(this: CanvasRenderingContext2D, ...args: [] | [Path2D]) {
          if (this.canvas.closest('[data-swarm-tour]')) throw new Error('Unavailable');
          return Reflect.apply(original, this, args);
        };
      } else {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, ...args: Parameters<HTMLCanvasElement['getContext']>) {
          if (this.closest('[data-swarm-tour]')) {
            if (failure === 'throwing canvas') throw new Error('Unavailable');
            return null;
          }
          return Reflect.apply(original, this, args);
        } as typeof original;
      }
    }, failure);
    await page.goto('/'); await page.waitForTimeout(500); await settled(page);
    expect(await page.locator('html').evaluate(element => getComputedStyle(element).overflowY)).not.toBe('hidden');
  });
}

async function mockMusic(page: Page, blocked = false) {
  const wav = Buffer.alloc(44 + 8000);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34); wav.write('data', 36); wav.writeUInt32LE(8000, 40); wav.fill(128, 44);
  await page.route('**/audio/swarm-background.mp3', route => route.fulfill({ status: 200, contentType: 'audio/wav', body: wav }));
  await page.addInitScript(blocked => {
    const state = { plays: 0, pauses: 0, time: 0, blocked };
    (window as Window & { swarmMusic?: typeof state }).swarmMusic = state;
    Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
      configurable: true, get() { return state.time; }, set(value: number) { state.time = value; },
    });
    HTMLMediaElement.prototype.play = function() {
      state.plays++;
      return state.blocked ? Promise.reject(new DOMException('Blocked', 'NotAllowedError')) : Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function() { state.pauses++; };
  }, blocked);
}

test('music volume, mute, Replay and Escape remain usable while scrolling is locked', async ({ page }) => {
  await mockMusic(page);
  await start(page);
  const audio = page.locator('[data-swarm-tour] audio');
  await expect(page.getByRole('button', { name: 'Music volume' })).toBeVisible();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.volume)).toBeCloseTo(0.3);
  await page.getByRole('button', { name: 'Music volume' }).click();
  const slider = page.getByRole('slider', { name: 'Music volume' });
  await slider.fill('55');
  await slider.press('ArrowRight');
  await expect(page.locator('#swarm-volume-panel output')).toHaveText('56%');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Mute', exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.muted)).toBe(true);
  await page.keyboard.press('Escape'); await settled(page);
  expect(await page.evaluate(() => (window as Window & { swarmMusic?: { pauses: number } }).swarmMusic!.pauses)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Replay animation' }).click();
  await expect(page.getByRole('button', { name: 'Music volume' })).toBeVisible();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.volume)).toBeCloseTo(0.56);
  expect(await page.evaluate(() => (window as Window & { swarmMusic?: { plays: number } }).swarmMusic!.plays)).toBeGreaterThan(1);
});

test('blocked autoplay offers late enablement at animation time', async ({ page }) => {
  await mockMusic(page, true);
  await start(page);
  await expect(page.getByRole('button', { name: 'Enable music' })).toBeVisible();
  await page.waitForTimeout(500);
  await page.evaluate(() => { (window as Window & { swarmMusic?: { blocked: boolean } }).swarmMusic!.blocked = false; });
  await page.getByRole('button', { name: 'Enable music' }).click();
  await expect(page.getByRole('slider', { name: 'Music volume' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Music volume' })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { swarmMusic?: { time: number } }).swarmMusic!.time)).toBeGreaterThan(0);
});

test('missing recording leaves animation active', async ({ page }) => {
  await page.route('**/audio/swarm-background.mp3', route => route.fulfill({ status: 404, body: '' }));
  await start(page);
  await expect(tour(page)).toHaveAttribute('data-mode', 'auto');
  await page.keyboard.press('Escape'); await settled(page);
});

test('music pauses with hidden tabs and modal locks and resumes at tour time', async ({ page }) => {
  await mockMusic(page);
  await start(page);
  const counts = () => page.evaluate(() => (window as Window & { swarmMusic?: { plays: number; pauses: number; time: number } }).swarmMusic!);
  const initial = await counts();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await counts()).pauses).toBeGreaterThan(initial.pauses);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await counts()).plays).toBeGreaterThan(initial.plays);
  const resumed = await counts();
  await page.evaluate(() => { document.documentElement.style.overflowY = 'hidden'; });
  await expect.poll(async () => (await counts()).pauses).toBeGreaterThan(resumed.pauses);
  await page.evaluate(() => { document.documentElement.style.removeProperty('overflow-y'); });
  await expect.poll(async () => (await counts()).plays).toBeGreaterThan(resumed.plays);
  expect((await counts()).time).toBeGreaterThan(0);
  await page.keyboard.press('Escape'); await settled(page);
});


test('supplied recording loads in the browser', async ({ page }) => {
  await start(page);
  const audio = page.locator('[data-swarm-tour] audio');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.readyState)).toBeGreaterThan(0);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.duration)).toBeGreaterThan(1);
  await page.keyboard.press('Escape'); await settled(page);
});
