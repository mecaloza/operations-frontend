import { Page } from '@playwright/test';

/**
 * Generate a valid mock JWT token for testing
 * Token expires in 1 year from now
 */
function generateMockJWT(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'test-user',
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Base64 encode (simple mock, not cryptographically signed)
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  
  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Setup authentication by setting a mock token in localStorage
 * This runs BEFORE any page load, injecting the token into localStorage
 */
export async function setupAuth(page: Page) {
  // Inject script that runs before page load
  await page.addInitScript(() => {
    // Generate a valid JWT token
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: 'test-user',
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
      iat: Math.floor(Date.now() / 1000)
    };
    
    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';
    
    const token = `${base64Header}.${base64Payload}.${signature}`;
    
    // Set token in localStorage
    window.localStorage.setItem('operations_token', token);
  });
}

/**
 * Login using the actual login flow
 */
export async function loginViaUI(page: Page, username = 'padawan', password = 'admin123') {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 5000 });
}
