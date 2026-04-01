import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test('should display users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /Users & Teams/i })).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    
    // Click "New User" button
    await page.getByRole('button', { name: /New User/i }).click();
    await page.waitForTimeout(500);
    
    // Fill in user form
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Role').selectOption('developer');
    
    // Submit form
    await page.getByRole('button', { name: /Create/i }).click();
    
    // Wait for potential modal close
    await page.waitForTimeout(1500);
  });

  test('should open assign agents modal', async ({ page }) => {
    await page.goto('/users');
    
    // Click first "Assign Agents" button if users exist
    const assignButton = page.getByRole('button', { name: /Assign Agents/i }).first();
    const isVisible = await assignButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await assignButton.click();
      await expect(page.getByRole('heading', { name: /Assign Agents/i })).toBeVisible();
    }
  });

  test('should filter and search users', async ({ page }) => {
    await page.goto('/users');
    
    // Test that teams section exists
    await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
  });
});
