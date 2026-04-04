import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';

test.describe('Transcripts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock authentication FIRST
    await setupAuth(page);
    
    // Mock tasks and epics endpoints (required by the page)
    await page.route('**/api/v1/tasks*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/api/v1/epics*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Default mock for transcripts (can be overridden in individual tests)
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });
  test('should load transcripts without crashing', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // Navigate to transcripts (mocks are already set in beforeEach)
    await page.goto('/transcripts', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Verificar que no hay error de "Cannot read properties of undefined"
    expect(errors).toEqual([]);
    
    // Debe mostrar título "Transcripts"
    await expect(page.getByRole('heading', { name: 'Transcripts' })).toBeVisible();
  });

  test('should display transcripts list', async ({ page }) => {
    await page.goto('/transcripts');
    
    // Esperar respuesta del API (puede ser vacía)
    await page.waitForLoadState('networkidle');
    
    // Debe mostrar el título (use role for specificity)
    await expect(page.getByRole('heading', { name: 'Transcripts' })).toBeVisible();
    
    // Debe mostrar filtros
    await expect(page.getByPlaceholder(/Search by agent/i)).toBeVisible();
  });

  test('should handle empty transcripts gracefully', async ({ page }) => {
    // Interceptar API y retornar array vacío
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Debe mostrar mensaje de vacío
    await expect(page.getByText(/No transcripts yet/i)).toBeVisible();
  });

  test('should handle transcripts with missing messages field', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // Interceptar API y retornar transcript sin messages
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-1',
            agent_id: 'agent-1',
            agent_name: 'Test Agent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // messages field is missing (undefined)
          }
        ])
      });
    });
    
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // No debe crashear
    expect(errors).toEqual([]);
    
    // Debe mostrar el transcript con "0 messages"
    await expect(page.getByText('Test Agent')).toBeVisible();
    await expect(page.getByText('0 messages')).toBeVisible();
  });

  test('should handle transcripts with null messages field', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // Interceptar API y retornar transcript con messages: null
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-2',
            agent_id: 'agent-2',
            agent_name: 'Null Messages Agent',
            messages: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      });
    });
    
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // No debe crashear
    expect(errors).toEqual([]);
    
    // Debe mostrar el transcript con "0 messages"
    await expect(page.getByText('Null Messages Agent')).toBeVisible();
    await expect(page.getByText('0 messages')).toBeVisible();
  });

  test('should filter by task', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Check task filter exists (select with options)
    const taskSelect = page.locator('select').first();
    await expect(taskSelect).toBeVisible();
  });

  test('should filter by epic', async ({ page }) => {
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Check epic filter exists (select with options)
    const epicSelect = page.locator('select').nth(1);
    await expect(epicSelect).toBeVisible();
  });

  test('should open transcript viewer on click', async ({ page }) => {
    // Mock con transcript válido
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-3',
            agent_id: 'agent-3',
            agent_name: 'View Test Agent',
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Test message',
                timestamp: new Date().toISOString()
              }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      });
    });
    
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Click "View" button
    const viewButton = page.getByRole('button', { name: /View/i }).first();
    await viewButton.click();
    
    // Modal should appear with transcript content
    await expect(page.getByText(/Transcript —/i)).toBeVisible();
    await expect(page.getByText('Test message')).toBeVisible();
  });

  test('should trigger download on download button', async ({ page }) => {
    // Mock con transcript válido
    await page.route('**/api/v1/transcripts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-4',
            agent_id: 'agent-4',
            agent_name: 'Download Test Agent',
            messages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
      });
    });
    
    // Mock download endpoint
    await page.route('**/api/v1/transcripts/test-4/download', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-4', messages: [] })
      });
    });
    
    await page.goto('/transcripts');
    await page.waitForLoadState('networkidle');
    
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.getByRole('button', { name: /Download/i }).first();
    await downloadButton.click();
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/transcript-.+\.json/);
  });
});
