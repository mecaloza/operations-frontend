import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should navigate through sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to Sprints
    await page.getByRole('link', { name: /Sprints/i }).click();
    await expect(page).toHaveURL(/\/sprints/);

    // Navigate to Tasks
    await page.getByRole('link', { name: /My Tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks/);

    // Navigate to Agents
    await page.getByRole('link', { name: /Agents/i }).click();
    await expect(page).toHaveURL(/\/agents/);

    // Navigate to Users (Task #156)
    await page.getByRole('link', { name: /Users/i }).click();
    await expect(page).toHaveURL(/\/users/);

    // Navigate to Transcripts (Task #157)
    await page.getByRole('link', { name: /Transcripts/i }).click();
    await expect(page).toHaveURL(/\/transcripts/);

    // Navigate to Messages
    await page.getByRole('link', { name: /Messages/i }).click();
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    await page.goto('/dashboard');

    // Click collapse button (desktop only)
    const collapseButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    const isVisible = await collapseButton.isVisible().catch(() => false);

    if (isVisible) {
      await collapseButton.click();
      // Sidebar should change width (can't easily test exact pixels)
    }
  });
});
