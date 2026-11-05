import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('czar-swarm-seen', '2'); } catch { /* Storage-denied cases use the normal site. */ } });
});

const picker = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^Cursor companion:/ });
const follower = (page: import('@playwright/test').Page) => page.locator('[data-cursor-companion]');
async function choose(page: import('@playwright/test').Page, name: string) {
  await picker(page).click();
  await page.getByRole('dialog', { name: 'Choose a cursor companion' }).getByRole('button', { name, exact: true }).click();
}

test('all companions, off, keyboard, persistence, and dismissal', async ({ page }) => {
  await page.goto('/about');
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Simba');
  await expect(follower(page)).toBeHidden();
  await picker(page).focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: 'Choose a cursor companion' });
  await expect(panel.getByRole('button', { name: 'Simba', exact: true })).toBeFocused();
  await expect(panel.getByRole('button', { name: 'Simba', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(picker(page)).toBeFocused();
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Billu');
  await page.reload();
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Billu');
  for (const name of ['AAAAA', 'Chitti', 'Simba', 'Off']) {
    await choose(page, name);
    await expect(picker(page)).toHaveAccessibleName(`Cursor companion: ${name}`);
    expect(await page.evaluate(() => localStorage.getItem('czar-pet'))).toBe(({ Simba: 'dog', Billu: 'cat', AAAAA: 'ghost', Chitti: 'robot', Off: 'off' } as Record<string, string>)[name]);
  }
  await page.reload();
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Off');
  await page.mouse.move(400, 300);
  await expect(follower(page)).toBeHidden();
  await picker(page).click();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(picker(page)).toBeFocused();
  await picker(page).click();
  await page.locator('main').click({ position: { x: 5, y: 100 } });
  await expect(panel).toBeHidden();
});

test('preferences synchronize and normalize across tabs', async ({ page, context }) => {
  await page.addInitScript(() => localStorage.setItem('czar-pet', 'invalid'));
  await page.goto('/about');
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Simba');
  const other = await context.newPage();
  await other.goto('/about');
  await choose(other, 'AAAAA');
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: AAAAA');
  await other.evaluate(() => localStorage.removeItem('czar-pet'));
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Simba');
  await other.evaluate(() => localStorage.setItem('czar-pet', 'robot'));
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Chitti');
  await other.evaluate(() => localStorage.clear());
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Simba');
});

test('storage failures leave selection functional', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage denied'); } });
  });
  await page.goto('/about');
  await choose(page, 'Billu');
  await expect(picker(page)).toHaveAccessibleName('Cursor companion: Billu');
  await choose(page, 'Off');
  await expect(follower(page)).toBeHidden();
});

test('crawls toward cursor, settles, turns, and clamps at edges without intercepting input', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 700 });
  await page.goto('/about');
  await expect(picker(page)).toBeVisible();
  await choose(page, 'Simba');
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  await page.mouse.move(380, 300);
  await expect(follower(page)).toBeVisible();
  const start = await follower(page).boundingBox();
  expect(start!.y).toBeGreaterThan(400);
  await page.clock.runFor(6500);
  await expect(follower(page)).toHaveAttribute('data-moving', 'false');
  const end = await follower(page).boundingBox();
  expect(Math.hypot(end!.x + 20 - 380, end!.y + 20 - 300)).toBeLessThanOrEqual(49);
  await page.mouse.move(100, 300);
  await page.clock.runFor(800);
  await expect(follower(page)).toHaveAttribute('data-moving', 'true');
  await expect(follower(page)).toHaveAttribute('data-direction', 'w');
  await page.clock.runFor(6500);
  await expect(follower(page)).toHaveAttribute('data-moving', 'false');
  for (const [x, y] of [[767, 699], [0, 0], [767, 0], [0, 699]]) {
    await page.mouse.move(x, y);
    await page.clock.runFor(12000);
    await expect(follower(page)).toHaveAttribute('data-moving', 'false');
    const bounds = await follower(page).boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(8);
    expect(bounds!.y).toBeGreaterThanOrEqual(8);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(760);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(692);
  }
  await expect(follower(page)).toHaveCSS('pointer-events', 'none');
  await expect(follower(page)).toHaveCSS('user-select', 'none');
  await expect(page.locator('body')).toHaveCSS('cursor', 'auto');
  await page.locator('main h1').evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el);
    const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range);
  });
  expect(await page.evaluate(() => window.getSelection()?.toString())).not.toBe('');
});

test('pauses for picker, modal, hidden tab, pointer leave, and route changes', async ({ page }) => {
  await page.goto('/about');
  await choose(page, 'Simba');
  await page.evaluate(() => localStorage.setItem('czar-swarm-seen', '2'));
  await page.mouse.move(450, 300);
  await expect(follower(page)).toBeVisible();
  await picker(page).click();
  await expect(follower(page)).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(440, 300);
  await expect(follower(page)).toBeVisible();
  await page.getByRole('button', { name: 'Search commands', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(450, 310);
  await expect(follower(page)).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
  await page.mouse.move(450, 320);
  await expect(follower(page)).toBeVisible();
  const beforeSwarm = await follower(page).boundingBox();
  await page.evaluate(() => document.documentElement.setAttribute('data-swarm-active', 'true'));
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(451, 320);
  await expect(follower(page)).toBeHidden();
  await page.evaluate(() => document.documentElement.removeAttribute('data-swarm-active'));
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(452, 320);
  const afterSwarm = await follower(page).boundingBox();
  expect(Math.hypot(afterSwarm!.x - beforeSwarm!.x, afterSwarm!.y - beforeSwarm!.y)).toBeLessThan(12);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(follower(page)).toBeHidden();
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(460, 320);
  await expect(follower(page)).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerout', { relatedTarget: null })));
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(470, 320);
  await expect(follower(page)).toBeVisible();
  await page.getByRole('link', { name: 'Czar16.', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(480, 320);
  await expect(follower(page)).toBeVisible();
});

test('reduced motion uses a static preview and resumes only on pointer input', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');
  await expect(picker(page).locator('svg[data-kind="dog"]')).toBeVisible();
  await page.mouse.move(400, 300);
  await expect(follower(page)).toBeHidden();
  await choose(page, 'AAAAA');
  await expect(picker(page).locator('svg[data-kind="ghost"]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(follower(page)).toBeHidden();
  await page.mouse.move(410, 300);
  await expect(follower(page)).toBeVisible();
});

test('touch pointer stays static', async ({ page }) => {
  await page.goto('/about');
  await expect(picker(page)).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 150, clientY: 200 })));
  await expect(follower(page)).toBeHidden();
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 375, 768, 1440]) {
    test(`picker and character animation positions: ${theme} ${width}px`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/about');
      await expect(picker(page)).toBeInViewport();
      const button = await picker(page).boundingBox();
      expect(button!.width).toBe(44);
      expect(button!.height).toBe(44);
      expect(button!.y).toBe(width < 400 ? 684 : 2);
      await picker(page).click();
      const panel = page.getByRole('dialog', { name: 'Choose a cursor companion' });
      await expect(panel).toBeInViewport({ ratio: 1 });
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-picker.png`) });
      await page.keyboard.press('Escape');
      await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
      await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
      for (const name of ['Simba', 'Billu', 'AAAAA', 'Chitti']) {
        await choose(page, name);
        await page.mouse.move(width / 2, 260);
        await expect(follower(page)).toBeVisible();
        await page.clock.runFor(10000);
        await expect(follower(page)).toHaveAttribute('data-moving', 'false');
        const rest = (await follower(page).boundingBox())!;
        await page.mouse.move(rest.x + 20 < width / 2 ? Math.min(width - 30, rest.x + 180) : Math.max(30, rest.x - 140), 100);
        await page.clock.runFor(800);
        await expect(follower(page)).toHaveAttribute('data-moving', 'true');
        await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-${name}-moving.png`) });
        await page.clock.runFor(3000);
        await expect(follower(page)).toHaveAttribute('data-moving', 'false');
        await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-${name}-idle.png`) });
        await expect(follower(page).locator('svg')).toHaveAttribute('shape-rendering', 'crispEdges');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}


test('touch devices show the selected static pixel preview', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Touch emulation');
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 800 } });
  await context.addInitScript(() => localStorage.setItem('czar-swarm-seen', '2'));
  const page = await context.newPage();
  await page.goto('/about');
  await expect(picker(page).locator('svg[data-kind="dog"]')).toBeVisible();
  await choose(page, 'Chitti');
  await expect(picker(page).locator('svg[data-kind="robot"]')).toBeVisible();
  await page.touchscreen.tap(100, 300);
  await expect(follower(page)).toBeHidden();
  await context.close();
});

test('400px toolbar fits and mobile picker clears Back to top', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/quotes');
  await expect(picker(page)).toBeInViewport();
  expect((await picker(page).boundingBox())!.y).toBeLessThan(49);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 800 }); await page.getByRole('button', { name: /20 lines Discipline/ }).click();
  await page.evaluate(() => window.scrollTo(0, 900));
  const back = page.getByRole('link', { name: 'Back to top' });
  await expect(back).toBeVisible();
  const petBounds = await picker(page).boundingBox();
  const backBounds = await back.boundingBox();
  expect(petBounds!.y + petBounds!.height).toBeLessThan(backBounds!.y);
  await picker(page).click();
  await expect(page.getByRole('dialog', { name: 'Choose a cursor companion' })).toBeInViewport({ ratio: 1 });
});


test('steps ten pixels every 100ms, alternates two poses, and never catches up a stall', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('/about');
  await expect(picker(page)).toBeVisible();
  await choose(page, 'Simba');
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);
  const pet = follower(page);
  for (const name of ['Simba', 'Billu', 'AAAAA', 'Chitti']) {
    await choose(page, name);
    await page.mouse.move(600, 50);
    await page.clock.runFor(150);
    const start = (await pet.boundingBox())!;
    const poses = new Set<string>();
    let previous = start;
    for (let i = 0; i < 10; i++) {
      const poseBefore = await pet.getAttribute('data-step');
      await page.clock.runFor(100);
      const current = (await pet.boundingBox())!;
      const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
      expect(distance).toBeGreaterThan(8.5);
      expect(distance).toBeLessThan(11.5);
      expect(Number.isInteger(current.x) && Number.isInteger(current.y)).toBe(true);
      const pose = await pet.getAttribute('data-step');
      expect(pose).not.toBe(poseBefore);
      poses.add(pose!);
      const visible = await pet.locator('[data-pose]:visible').all();
      expect(visible).toHaveLength(1);
      await expect(visible[0]).toHaveAttribute('data-pose', pose!);
      previous = current;
    }
    expect(poses.size).toBe(2);
    expect(Math.hypot(previous.x - start.x, previous.y - start.y)).toBeGreaterThan(98);
    const before = (await pet.boundingBox())!;
    await page.clock.fastForward(2000);
    const after = (await pet.boundingBox())!;
    expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(11.5);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.clock.runFor(1000);
    await page.mouse.move(610, 50);
    const resumed = (await pet.boundingBox())!;
    expect(resumed.x).toBe(after.x); expect(resumed.y).toBe(after.y);
  }
  await page.clock.runFor(15000);
  await expect(pet).toHaveAttribute('data-moving', 'false');
  await page.clock.runFor(21000);
  await expect(pet).toHaveAttribute('data-state', 'sleep');
});

test('eight directions, reversals, radius and boundary hysteresis', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1400 });
  await page.goto('/about');
  await expect(picker(page)).toBeVisible();
  await choose(page, 'Simba');
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);
  const pet = follower(page);
  await page.mouse.move(700, 700); await page.clock.runFor(12000);
  for (const [dx, dy, direction, view] of [
    [200, 0, 'e', 'side'], [200, 200, 'se', 'toward'], [0, 200, 's', 'front'],
    [-200, 200, 'sw', 'toward'], [-200, 0, 'w', 'side'], [-200, -200, 'nw', 'away'],
    [0, -200, 'n', 'back'], [200, -200, 'ne', 'away'],
  ] as const) {
    const pos = (await pet.boundingBox())!;
    const target = { x: pos.x + 20 + dx, y: pos.y + 20 + dy };
    await page.mouse.move(target.x, target.y);
    await page.clock.runFor(800);
    await expect(pet).toHaveAttribute('data-direction', direction);
    await expect(pet.locator(`[data-view="${view}"]`)).toBeVisible();
    await page.clock.runFor(4000);
    await expect(pet).toHaveAttribute('data-moving', 'false');
    await expect(pet).toHaveAttribute('data-direction', direction);
    const settled = (await pet.boundingBox())!;
    expect(Math.hypot(settled.x + 20 - target.x, settled.y + 20 - target.y)).toBeLessThan(49);
  }
  const pointAt = async (angle: number) => {
    const pos = (await pet.boundingBox())!;
    await page.mouse.move(pos.x + 20 + 300 * Math.cos(angle * Math.PI / 180), pos.y + 20 + 300 * Math.sin(angle * Math.PI / 180));
  };
  await pointAt(0); await page.clock.runFor(800);
  for (const angle of [24, 29, 25, 31, 26, 30, 35]) {
    await pointAt(angle); await page.clock.runFor(100);
    await expect(pet).toHaveAttribute('data-direction', angle === 35 ? 'se' : 'e');
  }
  await pointAt(180); await page.clock.runFor(100);
  await expect(pet).toHaveAttribute('data-direction', 'w');
});

for (const name of ['Simba', 'Billu', 'Chitti', 'AAAAA']) {
  test(`deterministic idle sequence, character artwork, sleep cadence and wake interruption: ${name}`, async ({ page }) => {
    await page.goto('/about');
    await expect(picker(page)).toBeVisible();
    await choose(page, 'Simba');
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    const pet = follower(page);
    await choose(page, name);
    // Spawn, then place the pointer at its centre to start a known rest.
    await page.mouse.move(500, 300);
    const start = (await pet.boundingBox())!;
    await page.mouse.move(start.x + 20, start.y + 20);
    await page.clock.runFor(150);
    await expect(pet).toHaveAttribute('data-state', 'idle');
    await page.clock.runFor(1900);
    await expect(pet).toHaveAttribute('data-state', 'look');
    await page.clock.runFor(1000);
    await expect(pet).toHaveAttribute('data-state', 'groom');
    await expect(pet.locator('[data-pose="groom"]:visible')).toHaveCount(1);
    await page.clock.runFor(1000);
    await expect(pet).toHaveAttribute('data-state', 'idle');
    await expect(pet).toHaveAttribute('data-blink', 'true');
    await page.clock.runFor(16000);
    await expect(pet).toHaveAttribute('data-state', 'tired');
    await page.clock.runFor(800);
    await expect(pet).toHaveAttribute('data-state', 'sleep');
    const sleeping = await pet.getAttribute('data-idle-step');
    await page.clock.runFor(400);
    expect(await pet.getAttribute('data-idle-step')).not.toBe(sleeping);
    await page.mouse.move(start.x + 25, start.y + 20);
    await page.clock.runFor(500);
    await expect(pet).toHaveAttribute('data-state', 'sleep');
    const wakeX = start.x > 640 ? start.x - 300 : start.x + 300;
    await page.mouse.move(wakeX, 100);
    await page.clock.runFor(100);
    await expect(pet).toHaveAttribute('data-state', 'alert');
    const waking = (await pet.boundingBox())!;
    // Further outside movement must not restart the alert timer.
    await page.mouse.move(wakeX + 10, 100);
    await page.clock.runFor(500);
    expect(await pet.boundingBox()).toEqual(waking);
    await page.clock.runFor(100);
    await expect(pet).toHaveAttribute('data-state', 'walk');
  });
}

test('pose sheets and real browser movement recordings', async ({ browser, browserName }, testInfo) => {
  test.skip(browserName === 'webkit', 'Visual review recordings use Chromium and Firefox');
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: testInfo.outputPath('recordings'), size: { width: 1440, height: 1000 } } });
  await context.addInitScript(() => localStorage.setItem('czar-swarm-seen', '2'));
  const page = await context.newPage();
  await page.goto('/about');
  await expect(picker(page)).toBeVisible();
  const sprites: string[] = [];
  for (const name of ['Simba', 'Billu', 'Chitti', 'AAAAA']) {
    await choose(page, name);
    await page.mouse.move(700, 450);
    await page.waitForTimeout(1000);
    await page.mouse.move(200, 700);
    await page.waitForTimeout(700);
    sprites.push(await follower(page).evaluate(el => el.outerHTML));
  }
  await page.clock.install();
  await page.clock.runFor(12000);
  await page.clock.runFor(22000);
  await page.waitForTimeout(500);
  await page.mouse.move(1100, 200);
  await page.waitForTimeout(1600);
  await page.evaluate((sprites) => {
    const sheet = document.createElement('div');
    sheet.id = 'pose-sheet';
    sheet.style.cssText = 'position:absolute;inset:0 auto auto 0;z-index:9999;background:#f6f4ee;color:#40313a;padding:20px;font:12px monospace;display:grid;grid-template-columns:80px repeat(9,60px);gap:8px;';
    for (const [index, sprite] of sprites.entries()) {
      for (const direction of ['e', 's', 'n', 'se', 'ne']) {
        const label = document.createElement('div'); label.textContent = `${['Simba', 'Billu', 'Chitti', 'AAAAA'][index]} ${direction}`; sheet.append(label);
        for (const pose of ['0', '1', 'idle', 'look', 'groom', 'alert', 'tired', 'sleep0', 'sleep1']) {
          const cell = document.createElement('div'); cell.innerHTML = sprite;
          const pet = cell.firstElementChild as HTMLElement;
          pet.hidden = false;
          pet.dataset.direction = direction;
          pet.dataset.state = ['0', '1'].includes(pose) ? 'walk' : pose.startsWith('sleep') ? 'sleep' : pose;
          pet.dataset.step = pose;
          pet.dataset.idleStep = pose === 'sleep1' ? '1' : '0';
          pet.dataset.blink = 'false';
          pet.style.cssText = 'position:relative;transform:none;';
          const caption = document.createElement('div'); caption.textContent = pose; cell.append(caption); sheet.append(cell);
        }
      }
    }
    document.body.append(sheet);
  }, sprites);
  await page.locator('#pose-sheet').screenshot({ path: testInfo.outputPath('poses-native.png') });
  await page.locator('#pose-sheet').evaluate(el => {
    (el as HTMLElement).style.gridTemplateColumns = '100px repeat(9,160px)';
    el.querySelectorAll<HTMLElement>('[data-cursor-companion]').forEach(pet => { pet.style.width = '160px'; pet.style.height = '160px'; });
    el.querySelectorAll<SVGElement>('svg').forEach(svg => { svg.setAttribute('width', '160'); svg.setAttribute('height', '160'); });
  });
  await page.locator('#pose-sheet').screenshot({ path: testInfo.outputPath('poses-enlarged.png') });
  await context.close();
});


for (const name of ['Simba', 'Billu', 'Chitti', 'AAAAA']) {
  test(`clicking each companion tells a new joke, supports the keyboard and keeps speech on screen: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/about');
    await expect(picker(page)).toBeVisible();
    await choose(page, 'Simba');
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 1000);
    await choose(page, name);
    await page.mouse.move(340, 600);
    await expect(follower(page)).toBeVisible();
    await page.clock.runFor(10000);
    const button = page.getByRole('button', { name: `Talk to ${name}`, exact: true });
    await button.click();
    const bubble = follower(page).getByRole('status');
    await expect(bubble).toBeVisible();
    await expect(bubble).toBeInViewport({ ratio: 1 });
    const first = await bubble.textContent();
    await button.click();
    expect(await bubble.textContent()).not.toBe(first);
    const second = await bubble.textContent();
    await button.focus();
    await page.keyboard.press('Enter');
    expect(await bubble.textContent()).not.toBe(second);
    await page.clock.runFor(3600);
    await expect(bubble).toBeHidden();
  });
}
