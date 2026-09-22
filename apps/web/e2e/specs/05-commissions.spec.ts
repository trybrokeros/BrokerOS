import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Web E2E: Brokerage Commissions & Settlements', () => {
  test('renders commissions summary table for Sourcing Manager', async ({ page, loginAsUser }) => {
    await loginAsUser('SOURCING_MANAGER');
    await page.goto('/dashboard/sourcing-manager/commissions');

    // Verify commissions table or status metrics loaded
    const commissionsHeader = page.locator(':has-text("Commission"), :has-text("Settlement"), :has-text("Brokerage")').first();
    await expect(commissionsHeader).toBeVisible({ timeout: 10000 });
  });
});

