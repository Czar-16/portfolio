import { test, expect } from '@playwright/test';

for (const failed of ['user', 'repos', 'both']) {
  test(`GitHub totals retain fallbacks when ${failed} requests fail`, async ({ page }) => {
    await page.route('https://api.github.com/**', route => {
      const repos = route.request().url().includes('/repos?');
      const failure = failed === 'both' || (repos ? failed === 'repos' : failed === 'user');
      return route.fulfill({ status: failure ? 403 : 200, headers: { 'access-control-allow-origin': '*' }, json: failure ? { message: 'API rate limit exceeded' } : repos ? [{ stargazers_count: 5 }, { stargazers_count: 8 }] : { public_repos: 40 } });
    });
    await page.goto('/');
    const stats = page.getByRole('group', { name: 'GitHub statistics' });
    await expect(stats).toHaveAttribute('aria-busy', 'false');
    await expect(stats.locator('.github-stat').nth(0)).toContainText(failed === 'repos' ? '40' : '22');
    await expect(stats.locator('.github-stat').nth(1)).toContainText(failed === 'user' ? '13' : '22');
    await expect(page.getByRole('status').filter({ hasText: 'Live GitHub statistics unavailable' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'GitHub Activity', exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Featured repositories' })).toHaveCount(0);
    await expect(page.getByText('See more on GitHub')).toHaveCount(0);
  });
}
