import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Web E2E: Authentication & Role Workspaces', () => {
  test.beforeEach(async ({ page, context }) => {
    // Intercept all API and proxy requests
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url();
      if (url.includes('roles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'role-pre-sales-manager', name: 'Pre-Sales Manager', code: 'PRE_SALES_MANAGER' },
            { id: 'role-sales-executive', name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
            { id: 'role-sourcing-manager', name: 'Sourcing Manager', code: 'SOURCING_MANAGER' },
          ]),
        });
        return;
      }

      if (url.includes('sign-in')) {
        let postData: any = {};
        try {
          postData = route.request().postDataJSON() || {};
        } catch {}

        if (postData.email?.includes('invalid')) {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: { message: 'Invalid credentials or role identity mismatch.' } }),
          });
        } else {
          await context.addCookies([
            { name: 'better-auth.session_token', value: 'mock-session-token', domain: 'localhost', path: '/' },
          ]);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                user: {
                  id: 'usr-1',
                  email: postData.email || 'pre-sales-manager@brokeros.com',
                  roleId: 'role-pre-sales-manager',
                  role: 'PRE_SALES_MANAGER',
                },
              },
            }),
          });
        }
        return;
      }

      if (url.includes('get-session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'usr-1',
              name: 'Pre-Sales Manager',
              email: 'pre-sales-manager@brokeros.com',
              roleId: 'role-pre-sales-manager',
              role: 'PRE_SALES_MANAGER',
            },
            session: { id: 'sess-1', userId: 'usr-1' },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Also catch direct /roles endpoint
    await page.route('**/roles', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'role-pre-sales-manager', name: 'Pre-Sales Manager', code: 'PRE_SALES_MANAGER' },
          { id: 'role-sales-executive', name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
          { id: 'role-sourcing-manager', name: 'Sourcing Manager', code: 'SOURCING_MANAGER' },
        ]),
      });
    });

    await page.goto('/login');
  });

  test('displays login screen with branding and input controls', async ({ page }) => {
    await expect(page.locator('text=BrokerOS').first()).toBeVisible();
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign In")')).toBeVisible();
  });

  test('shows error notification when attempting login with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'invalid.user@brokeros.com');
    await page.fill('input[type="password"]', 'WrongPassword123');

    // Select role if present
    const roleSelect = page.locator('select');
    if (await roleSelect.isVisible().catch(() => false)) {
      await page.waitForSelector('select option:not([disabled])', { state: 'attached', timeout: 5000 }).catch(() => {});
      await roleSelect.selectOption({ index: 1 }).catch(() => {});
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Verify Identity")');
    await submitButton.click();

    // Verify error toast or error message alert appears
    const errorNotice = page.locator('[role="alert"], .text-red-500, :text("Invalid credentials"), :text("select your assigned role")').first();
    await expect(errorNotice).toBeVisible({ timeout: 5000 });
  });

  test('successfully authenticates Pre-Sales Manager and redirects to dashboard shell', async ({ page }) => {
    const user = TEST_USERS.PRE_SALES_MANAGER;

    await page.fill('input[type="email"], input[placeholder*="email" i]', user.email);
    
    // Fill required phone number
    const phoneInput = page.locator('input[placeholder*="98765" i], input[type="tel"], input[placeholder*="phone" i]').first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('+91 98765 43210');
    }

    // Wait for role options to load and select first valid role
    const roleSelect = page.locator('select');
    if (await roleSelect.isVisible().catch(() => false)) {
      await page.waitForSelector('select option:not([disabled])', { state: 'attached', timeout: 5000 });
      await roleSelect.selectOption({ index: 1 });
    }

    await page.fill('input[type="password"]', user.password);

    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Verify Identity")');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Assert dashboard layout loaded
    expect(page.url()).toContain('/dashboard');
  });
});
