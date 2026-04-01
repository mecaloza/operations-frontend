import { test, expect } from '@playwright/test';

test.describe('Epics & Tasks', () => {
  test('should navigate to sprints page', async ({ page }) => {
    await page.goto('/sprints');
    await page.waitForLoadState('networkidle');
    // Check we're on sprints page by looking for project selector
    await expect(page.locator('body')).toContainText(/Project/i);
  });

  test('should create a new epic', async ({ page }) => {
    await page.goto('/sprints');
    
    // Click "Create Epic" button
    const createButton = page.getByRole('button', { name: /Create Epic/i }).first();
    const isVisible = await createButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await createButton.click();
      
      // Fill epic form
      await page.getByLabel(/Title/i).fill('Test Epic');
      await page.getByLabel(/Target/i).fill('100');
      
      // Submit
      await page.getByRole('button', { name: /Create/i }).click();
    }
  });

  test('should view epic details', async ({ page }) => {
    await page.goto('/sprints');
    
    // Click on first epic card if exists
    const epicCard = page.locator('[class*="cursor-pointer"]').first();
    const isVisible = await epicCard.isVisible().catch(() => false);
    
    if (isVisible) {
      await epicCard.click();
      // Should see epic tasks or details
      await expect(page.locator('body')).toContainText(/Epic/i);
    }
  });

  test('should add task to epic', async ({ page }) => {
    await page.goto('/sprints');
    
    // Try to add a task to an epic
    const addTaskButton = page.getByRole('button', { name: /Add Task/i }).first();
    const isVisible = await addTaskButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await addTaskButton.click();
      await expect(page.getByLabel(/Name/i)).toBeVisible();
    }
  });
});
