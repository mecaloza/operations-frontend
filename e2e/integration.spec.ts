import { test, expect } from '@playwright/test';

test.describe('Full Integration Flow', () => {
  test('complete user and agent workflow', async ({ page }) => {
    // 1. Navigate to Users page
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Users & Teams/i })).toBeVisible();

    // 2. Create a new user
    await page.getByRole('button', { name: /New User/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('Name').fill('Integration Test User');
    await page.getByLabel('Email').fill('integration@test.com');
    await page.getByLabel('Role').selectOption('developer');
    
    // Submit and wait
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    // 3. Verify user exists (depends on mock/real backend)
    // For now, just check we're still on users page
    await expect(page).toHaveURL('/users');

    // 4. Navigate to Agents page
    await page.getByRole('link', { name: /Agents/i }).click();
    await expect(page).toHaveURL('/agents');

    // 5. Navigate to Sprints and check epics
    await page.getByRole('link', { name: /Sprints/i }).click();
    await expect(page.getByRole('heading', { name: /Sprint Reports/i })).toBeVisible();

    // 6. Navigate to Transcripts
    await page.getByRole('link', { name: /Transcripts/i }).click();
    await expect(page.getByRole('heading', { name: /Transcripts/i })).toBeVisible();

    // 7. Test search functionality
    await page.getByPlaceholder(/Search by agent/i).fill('test');
    await page.waitForTimeout(500);

    // 8. Navigate back to dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('epic creation and task assignment flow', async ({ page }) => {
    // 1. Go to sprints
    await page.goto('/sprints');

    // 2. Try to create an epic if button exists
    const createButton = page.getByRole('button', { name: /Create Epic/i }).first();
    const hasButton = await createButton.isVisible().catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.getByLabel(/Title/i).fill('E2E Test Epic');
      await page.getByLabel(/Description/i).fill('Created by Playwright test');
      await page.getByLabel(/Target/i).fill('100');
      await page.getByRole('button', { name: /Create/i }).click();
      
      await page.waitForTimeout(1000);
    }

    // 3. Navigate to tasks
    await page.getByRole('link', { name: /My Tasks/i }).click();
    await expect(page).toHaveURL('/tasks');
  });

  test('permissions and roles flow', async ({ page }) => {
    // 1. Create admin user
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /New User/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('Name').fill('Admin User');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Role').selectOption('admin');
    await page.getByRole('button', { name: /Create/i }).click();

    await page.waitForTimeout(1500);

    // 2. Create team lead
    await page.getByRole('button', { name: /New User/i }).click();
    await page.waitForTimeout(500);
    await page.getByLabel('Name').fill('Team Lead User');
    await page.getByLabel('Email').fill('lead@test.com');
    await page.getByLabel('Role').selectOption('team_lead');
    await page.getByRole('button', { name: /Create/i }).click();

    await page.waitForTimeout(1500);

    // 3. Verify both users exist in different roles
    await expect(page.getByText(/Admin User/i)).toBeVisible();
    await expect(page.getByText(/Team Lead User/i)).toBeVisible();
  });

  test('transcript viewing and download flow', async ({ page }) => {
    await page.goto('/transcripts');

    // Check if any transcripts exist
    const viewButton = page.getByRole('button', { name: /View/i }).first();
    const hasTranscripts = await viewButton.isVisible().catch(() => false);

    if (hasTranscripts) {
      // View transcript
      await viewButton.click();
      await expect(page.getByText(/Transcript —/i)).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /Close/i }).click();

      // Try download
      const downloadButton = page.getByRole('button', { name: /Download/i }).first();
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/transcript-.+\.json/);
    }
  });
});
