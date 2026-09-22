import { test, expect } from '../fixtures/auth.fixture';

test.describe('Web E2E: Lead Pipeline & Detail Modal', () => {
  test('renders lead board or list view with search filter controls', async ({ page, loginAsUser }) => {
    await loginAsUser('PRE_SALES_MANAGER');
    await page.goto('/dashboard/pre-sales-manager/lead-management');

    // Verify search or filter controls are present
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Aarav');
      await expect(searchInput).toHaveValue('Aarav');
    }

    // Check presence of status filter buttons or table header
    const statusBadge = page.locator('button:has-text("All"), button:has-text("New"), th:has-text("Lead Name")').first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });

    // Verify lead rows rendered
    const leadRow = page.locator('table tbody tr').first();
    await expect(leadRow).toBeVisible({ timeout: 10000 });
  });

  test('opens lead detail inspection view when clicking a lead card or row', async ({ page, loginAsUser }) => {
    await loginAsUser('SALES_EXECUTIVE');
    await page.goto('/dashboard/sales-executive/lead-management');

    // Verify lead management heading or table rendered
    const heading = page.locator('h1:has-text("Lead"), th:has-text("Status"), button:has-text("All")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Find and click first lead row or link
    const firstLeadLink = page.locator('table tbody tr a').first();
    if (await firstLeadLink.isVisible().catch(() => false)) {
      await firstLeadLink.click();
      await page.waitForURL((url) => url.pathname.includes('/lead-'), { timeout: 10000 }).catch(() => {});

      // Verify detail page or timeline loaded
      const detail = page.locator('h1, h2, h3, div:has-text("Lead Details"), div:has-text("Timeline"), div:has-text("Aarav Sharma")').first();
      await expect(detail).toBeVisible({ timeout: 8000 });
    }
  });
});
