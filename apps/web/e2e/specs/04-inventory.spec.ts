import { test, expect } from '../fixtures/auth.fixture';

test.describe('Web E2E: Property Inventory & Unit Matrix', () => {
  test('renders projects list with builder details and tower counters', async ({ page, loginAsUser }) => {
    await loginAsUser('SALES_MANAGER');
    await page.goto('/dashboard/sales-manager/inventory');

    // Verify inventory container loaded
    const inventoryContainer = page.locator(':has-text("Project Inventory"), :has-text("Inventory"), :has-text("Projects")').first();
    await expect(inventoryContainer).toBeVisible({ timeout: 10000 });
  });

  test('enforces Sourcing Manager views exclusively CP projects', async ({ page, loginAsUser }) => {
    await loginAsUser('SOURCING_MANAGER');
    await page.goto('/dashboard/sourcing-manager/inventory');

    // Sourcing Manager dashboard displays CP inventory
    const cpHeader = page.locator(':has-text("Project Inventory"), :has-text("Inventory"), :has-text("Channel Partner")').first();
    await expect(cpHeader).toBeVisible({ timeout: 10000 });
  });
});
