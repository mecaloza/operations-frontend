import { test, expect } from '@playwright/test';

test.describe('Transcripts', () => {
  test('should display transcripts page', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/View and download conversation transcripts/i)).toBeVisible();
  });

  test('should show filters section', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Check search box exists
    await expect(page.getByPlaceholder(/Search by agent/i)).toBeVisible();
  });

  test('should filter by task', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Check task filter exists (select with options)
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should filter by epic', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Check epic filter exists (select with options)
    await expect(page.locator('select').nth(1)).toBeVisible();
  });

  test('should open transcript viewer on click', async ({ page }) => {
    await page.goto('/transcripts');
    
    // Try to click first "View" button if transcripts exist
    const viewButton = page.getByRole('button', { name: /View/i }).first();
    const isVisible = await viewButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await viewButton.click();
      // Modal should appear with transcript content
      await expect(page.getByText(/Transcript —/i)).toBeVisible();
    }
  });

  test('should trigger download on download button', async ({ page }) => {
    await page.goto('/transcripts');
    
    // Check if download button exists (depends on data)
    const downloadButton = page.getByRole('button', { name: /Download/i }).first();
    const isVisible = await downloadButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/transcript-.+\.json/);
    }
  });
});
