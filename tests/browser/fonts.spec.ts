import { test, expect } from '@playwright/test';

const presets = ['clean', 'contrast', 'developer'] as const;
const names = ['Instrument Sans', 'Public Sans', 'Manrope'];

test.beforeEach(async ({ context }) => {
  await context.route('https://api.github.com/**', route => route.fulfill({ headers: { 'access-control-allow-origin': '*' }, json: route.request().url().includes('/repos?') ? [{ stargazers_count: 7 }] : { public_repos: 30 } }));
  await context.route('https://github-contributions-api.jogruber.de/**', route => route.fulfill({ headers: { 'access-control-allow-origin': '*' }, json: { contributions: [] } }));
  await context.route('**/api/leetcode', route => route.fulfill({ status: 503, json: {} }));
  await context.route('**/api/x-posts', route => route.fulfill({ json: { posts: [] } }));
});

test('font cycle, keyboard, persistence, navigation and tab synchronization', async ({ page, context }) => {
  await page.goto('/projects');
  const button = page.getByRole('button', { name: /^Font:/ });
  for (let i = 0; i < presets.length; i++) {
    await expect(button).toHaveAttribute('title', `Font: ${names[i]}. Switch to ${names[(i + 1) % 3]}`);
    await button.focus();
    await page.keyboard.press(i === 1 ? 'Space' : 'Enter');
    await expect(page.locator('html')).toHaveAttribute('data-font', presets[(i + 1) % 3]);
  }
  await button.click();
  await expect(page.getByRole('status').filter({ hasText: 'Font preset: Public Sans' })).toHaveCount(1);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-font', 'contrast');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Main', exact: true }).getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL('/about');
  await expect(page.locator('html')).toHaveAttribute('data-font', 'contrast');
  const other = await context.newPage();
  await other.goto('/about');
  await other.getByRole('button', { name: /^Font:/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-font', 'developer');
  for (const value of ['invalid', 'contrast', null]) {
    await other.evaluate(value => value === null ? localStorage.removeItem('czar-font') : localStorage.setItem('czar-font', value), value);
    await expect(page.locator('html')).toHaveAttribute('data-font', value === 'contrast' ? 'contrast' : 'clean');
  }
});

for (const value of ['clean', 'contrast', 'developer', 'invalid', '']) {
  test(`restores ${value || 'missing'} preference before hydration`, async ({ page }) => {
    await page.addInitScript(value => { if (value) localStorage.setItem('czar-font', value); }, value);
    await page.route('**/*.js*', route => route.abort());
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('data-font', presets.includes(value as typeof presets[number]) ? value : 'clean');
  });
}

test('switching works when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage denied'); } }));
  await page.goto('/about');
  for (const preset of ['contrast', 'developer', 'clean']) {
    await page.getByRole('button', { name: /^Font:/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font', preset);
  }
});

test('touch control moves into the menu below 400px and keeps 44px targets', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  await page.goto('/about');
  await expect(page.getByRole('button', { name: /^Font:/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  const button = page.getByRole('button', { name: /^Font:/ });
  await expect(button).toHaveAccessibleName('Font: Instrument Sans. Switch to Public Sans');
  await button.tap();
  await expect(button).toHaveAccessibleName('Font: Public Sans. Switch to Manrope');
  await expect(page.locator('html')).toHaveAttribute('data-font', 'contrast');
  for (const control of await page.locator('.compact-toolbar button, #mobile-menu button').all()) {
    if (!await control.isVisible()) continue;
    const box = (await control.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({ width: 400, height: 320 });
  await expect(page.locator('.font-toolbar-control button')).toBeVisible();
  await expect(page.locator('.font-menu-control button')).toBeHidden();
  await context.close();
});

for (const [index, preset] of presets.entries()) {
  test(`computed font families for ${preset}`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('czar-font', value), preset);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => {
      const family = (selector: string) => getComputedStyle(document.querySelector(selector)!).fontFamily;
      return { body: family('body'), navigation: family('.compact-toolbar a'), heading: family('h1'), title: family('.project-title'), prose: family('.project-description'), control: family('.compact-toolbar button'), terminal: family('[aria-label="Terminal command"]') };
    });
    expect(fonts.heading).toMatch([/Instrument Sans/i, /Public Sans/i, /Manrope/i][index]);
    expect(fonts.body).toBe(fonts.heading);
    expect(fonts.navigation).toBe(fonts.heading);
    expect(fonts.title).toBe(fonts.heading);
    expect(fonts.prose).toBe(fonts.heading);
    expect(fonts.control).toBe(fonts.heading);
    expect(fonts.terminal).toMatch(/Geist Mono/i);
    await expect(page.getByText('Featured Repositories')).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'GitHub statistics' })).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.github-stat').nth(0)).toContainText('30');
    await expect(page.locator('.github-stat').nth(1)).toContainText('7');
    await expect(page.locator('.project-description').first()).toHaveCSS('-webkit-line-clamp', '2');
    await page.getByRole('button', { name: /^Details for/ }).first().click();
    await expect(page.locator('.project-card').first()).toHaveAttribute('data-details-open', 'true');
  });
}

for (const theme of ['dark', 'light'] as const) {
  for (const width of [320, 375, 480, 768, 1440]) {
    test(`all font presets and routes fit: ${theme} ${width}px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: width === 768 ? 320 : 900 });
      for (const preset of presets) {
        await page.goto('/about', { waitUntil: 'domcontentloaded' });
        await page.evaluate(value => localStorage.setItem('czar-font', value), preset);
        for (const route of ['/', '/about', '/projects', '/stack', '/quotes', '/watch', '/missing-page']) {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('h1')).toBeVisible();
          await expect(page.locator('html')).toHaveAttribute('data-font', preset);
          await page.evaluate(() => document.fonts.ready);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `${preset} ${route}`).toBe(true);
          const toolbar = page.locator('.compact-toolbar');
          if (route === '/quotes') {
            await expect(async () => {
              await page.getByRole('button', { name: 'Search commands' }).click();
              await expect(page.getByRole('combobox')).toBeInViewport({ timeout: 1_000 });
            }).toPass({ timeout: 10_000 });
            await page.getByRole('combobox').press('Escape');
          }
          for (const button of await toolbar.locator('button').all()) {
            if (await button.isVisible()) await expect(button).toBeInViewport();
          }
        }
      }
    });
  }
}
