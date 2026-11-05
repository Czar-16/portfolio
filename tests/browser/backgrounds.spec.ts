import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('czar-swarm-seen', '2'); } catch { /* Storage-denied cases use the normal site. */ } });
});

test('background selection persists and remains independent of theme across navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
  const originalTheme = await page.locator('html').getAttribute('data-theme');
  await expect(page.locator('[data-ambient-background] canvas')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', originalTheme!);
  await page.getByRole('button', { name: /Switch to .* mode/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to constellation background' })).toBeVisible();
  await page.getByRole('button', { name: 'Search commands', exact: true }).click();
  await page.getByRole('dialog', { name: 'Command palette' }).getByRole('option', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL('/about');
  await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
  await page.getByRole('button', { name: 'Switch to constellation background' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-background', 'constellation');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-background', 'constellation');
  await page.getByRole('button', { name: 'Switch to bokeh background' }).click();
  await page.getByRole('button', { name: 'Switch to spotlight background' }).click();
  await page.getByRole('button', { name: 'Switch to aurora background' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-background', 'aurora');
  await expect(page.locator('[data-ambient-background] canvas')).not.toHaveAttribute('data-ready');
});

for (const failure of ['null', 'throw']) {
  test(`background selection works without storage and with ${failure} canvas`, async ({ page }) => {
    await page.addInitScript(failure => {
      Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage denied'); } });
      const getContext = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: function(this: HTMLCanvasElement, ...args: Parameters<HTMLCanvasElement['getContext']>) {
          if (!this.closest('[data-point-background]')) return Reflect.apply(getContext, this, args);
          if (failure === 'throw') throw new Error('Canvas denied');
          return null;
        },
      });
    }, failure);
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
    const fallback = page.locator('[data-ambient-background] canvas').locator('..');
    expect(await fallback.evaluate(el => getComputedStyle(el, '::before').display)).not.toBe('none');
    await page.getByRole('button', { name: 'Switch to constellation background' }).click();
    await expect(page.locator('[data-point-background]')).toBeVisible();
    await expect(page.locator('[data-point-background] canvas')).not.toHaveAttribute('data-ready');
    expect(await fallback.evaluate(el => getComputedStyle(el, '::before').display)).not.toBe('none');
    await page.getByRole('button', { name: 'Switch to bokeh background' }).click();
    await page.getByRole('button', { name: 'Switch to spotlight background' }).click();
    await page.getByRole('button', { name: 'Switch to aurora background' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-background', 'aurora');
  });
}

for (const style of ['particles', 'constellation']) {
  test(`${style} stops for reduced motion and hidden documents and resumes when visible`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('czar-background', 'aurora'));
    await page.goto('/about');
    const ambient = page.locator('[data-ambient-background]');
    const wash = ambient.locator('> div').first().locator('> div').first();
    await expect(wash).toHaveCSS('animation-play-state', 'running');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(wash).toHaveCSS('animation-play-state', 'paused');
    await page.evaluate(() => {
      Reflect.deleteProperty(document, 'hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(wash).toHaveCSS('animation-play-state', 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(wash).toHaveCSS('animation-name', 'none');
    await page.getByRole('button', { name: 'Switch to particles background' }).click();
    if (style === 'constellation') await page.getByRole('button', { name: 'Switch to constellation background' }).click();
    const canvas = ambient.locator('canvas');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    const still = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    await page.clock.install();
    await page.clock.runFor(1000);
    expect(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).toBe(still);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).not.toBe(still);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(ambient).toHaveAttribute('data-paused', 'true');
    const paused = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    await page.clock.runFor(1000);
    expect(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).toBe(paused);
  });
}

for (const theme of ['dark', 'light'] as const) {
  for (const width of [320, 768, 1440]) {
    test(`${theme} backgrounds and dotted dividers fit at ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      for (const background of ['particles', 'constellation', 'bokeh', 'spotlight', 'aurora'] as const) {
        if (background !== 'particles') await page.getByRole('button', { name: `Switch to ${background} background` }).click();
        await expect(page.locator('html')).toHaveAttribute('data-background', background);
        const measurements = await page.evaluate(() => {
          const column = document.querySelector('main')!.getBoundingClientRect();
          const sections = Array.from(document.querySelectorAll('main .section-frame'));
          return {
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            dividersFit: sections.every(el => {
              const rule = getComputedStyle(el, '::before');
              return rule.left === '0px' && parseFloat(rule.width) <= column.width && rule.backgroundImage.includes('radial-gradient');
            }),
          };
        });
        expect(measurements).toEqual({ overflow: false, dividersFit: true });
        const toggle = page.getByRole('button', { name: `Switch to ${{ aurora: 'particles', particles: 'constellation', constellation: 'bokeh', bokeh: 'spotlight', spotlight: 'aurora' }[background]} background` });
        await expect(toggle).toBeInViewport();
        const bounds = await toggle.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-${background}.png`) });
      }
    });
  }
}

for (const background of ['aurora', 'particles', 'constellation', 'bokeh', 'spotlight', 'waves', 'invalid', '']) {
  test(`saved ${background || 'missing'} initializes before hydration`, async ({ browser }) => {
    // Seed storage, then block hydration bundles to isolate the inline initialization.
    const seed = await browser.newContext();
    const setup = await seed.newPage();
    await setup.goto('/about');
    await setup.evaluate(value => value ? localStorage.setItem('czar-background', value) : localStorage.removeItem('czar-background'), background);
    const state = await seed.storageState();
    await seed.close();
    const stored = await browser.newContext({ storageState: state });
    const page = await stored.newPage();
    await page.route('**/*.js*', route => route.abort());
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('data-background', ['waves', 'invalid', ''].includes(background) ? 'particles' : background);
    await stored.close();
  });
}

test('new selections synchronize across tabs, including preference removal', async ({ page, context }) => {
  await page.goto('/about');
  const other = await context.newPage();
  await other.goto('/about');
  for (const background of ['constellation', 'bokeh', 'spotlight', 'aurora', 'particles']) {
    await other.getByRole('button', { name: `Switch to ${background} background` }).click();
    await expect(page.locator('html')).toHaveAttribute('data-background', background);
  }
  await other.evaluate(() => localStorage.setItem('czar-background', 'waves'));
  await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
  await other.evaluate(() => localStorage.setItem('czar-background', 'bokeh'));
  await expect(page.locator('html')).toHaveAttribute('data-background', 'bokeh');
  await other.evaluate(() => localStorage.removeItem('czar-background'));
  await expect(page.locator('html')).toHaveAttribute('data-background', 'particles');
});

for (const background of ['bokeh', 'spotlight']) {
  test(`${background} pauses when hidden or inactive and stays static with reduced motion`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('czar-background', value), background);
    await page.goto('/about');
    const layer = page.locator(`[data-${background}-background]`);
    const light = layer.locator('> div').first();
    await expect(light).toHaveCSS('animation-play-state', 'running');
    await expect(page.locator('[data-ambient-background] canvas')).not.toHaveAttribute('data-ready');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(light).toHaveCSS('animation-play-state', 'paused');
    await page.evaluate(() => {
      Reflect.deleteProperty(document, 'hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(light).toHaveCSS('animation-play-state', 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(light).toHaveCSS('animation-name', 'none');
    await expect(layer).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(light).not.toHaveCSS('animation-name', 'none');
    const button = page.getByRole('button', { name: /Switch to .* background/ });
    await button.focus();
    await page.keyboard.press('Space');
    await expect(layer).toBeHidden();
    await expect(light).toHaveCSS('animation-play-state', 'paused');
  });
}

for (const theme of ['dark', 'light'] as const) {
  for (const width of [320, 768, 1440]) {
    test(`new animated backgrounds at several positions: ${theme} ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/about');
      await page.clock.install();
      for (const background of ['constellation', 'bokeh', 'spotlight']) {
        await page.getByRole('button', { name: `Switch to ${background} background` }).click();
        if (background === 'constellation') await expect(page.locator('[data-point-background] canvas')).toHaveAttribute('data-ready', 'true');
        for (const time of [0, 12000, 24000]) {
          if (background === 'constellation' && time > 0) await page.clock.runFor(12000);
          await page.locator('[data-ambient-background]').evaluate((el, time) => {
            for (const animation of el.getAnimations({ subtree: true })) {
              animation.pause();
              animation.currentTime = time;
            }
          }, time);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
          await expect(page.getByRole('button', { name: /Switch to .* background/ })).toBeInViewport();
          await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-${background}-${time}.png`) });
        }
        await page.getByRole('button', { name: /Switch to .* mode/ }).click();
        await expect(page.locator('html')).toHaveAttribute('data-background', background);
        await page.getByRole('button', { name: /Switch to .* mode/ }).click();
      }
    });
  }
}

test('constellation respects point, connection, and pixel-density limits after resizing', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('czar-background', 'constellation');
    type Frame = { points: number; edges: [number, number, number, number][] };
    const state = window as typeof window & { ambientFrame: Frame };
    state.ambientFrame = { points: 0, edges: [] };
    const prototype = CanvasRenderingContext2D.prototype;
    const { clearRect, arc, moveTo, lineTo } = prototype;
    let start = [0, 0];
    prototype.clearRect = function(...args) {
      if (this.canvas.closest('[data-point-background]')) state.ambientFrame = { points: 0, edges: [] };
      return clearRect.apply(this, args);
    };
    prototype.arc = function(...args) {
      if (this.canvas.closest('[data-point-background]')) state.ambientFrame.points++;
      return arc.apply(this, args);
    };
    prototype.moveTo = function(x, y) {
      start = [x, y];
      return moveTo.call(this, x, y);
    };
    prototype.lineTo = function(x, y) {
      if (this.canvas.closest('[data-point-background]')) state.ambientFrame.edges.push([start[0], start[1], x, y]);
      return lineTo.call(this, x, y);
    };
  });
  await page.goto('/about');
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const canvas = page.locator('[data-point-background] canvas');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    await expect(canvas).toHaveAttribute('width', String(width * 2));
    const frame = await page.evaluate(() => (window as typeof window & { ambientFrame: { points: number; edges: number[][] } }).ambientFrame);
    expect(frame.points).toBe(width === 320 ? 24 : 48);
    expect(frame.edges.length).toBeGreaterThan(0);
    const connections = new Map<string, number>();
    for (const [x1, y1, x2, y2] of frame.edges) {
      expect(Math.hypot(x2 - x1, y2 - y1)).toBeLessThan(110);
      for (const point of [`${x1},${y1}`, `${x2},${y2}`]) connections.set(point, (connections.get(point) ?? 0) + 1);
    }
    expect(Math.max(...connections.values())).toBeLessThanOrEqual(2);
  }
  await context.close();
});
