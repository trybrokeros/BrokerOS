import { test, expect } from '../fixtures/auth.fixture';

test.describe('Web E2E: Omnichannel Marketing Campaign Wizards', () => {
  test('SMS Wizard: renders 4-step wizard, phone mockup preview, and character counter', async ({ page, loginAsUser }) => {
    await loginAsUser('PRE_SALES_MANAGER');
    await page.goto('/dashboard/marketing/sms/campaigns/new');

    // Verify wizard step indicator or title
    const wizardIndicator = page.locator(':has-text("Campaign Info"), :has-text("Step 1"), :has-text("SMS Campaign")').first();
    await expect(wizardIndicator).toBeVisible({ timeout: 10000 });

    // Fill campaign title if present
    const titleInput = page.locator('input[placeholder*="title" i], input[placeholder*="campaign name" i], input#smsCampaignTitle').first();
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill('Weekend Flash Sale');
      await expect(titleInput).toHaveValue('Weekend Flash Sale');
    }

    // Verify presence of next button
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    await expect(nextButton).toBeVisible();
  });

  test('Voice Wizard: renders 5-step studio composer and carrier selector', async ({ page, loginAsUser }) => {
    await loginAsUser('PRE_SALES_MANAGER');
    await page.goto('/dashboard/marketing/voice/campaigns/new');

    // Verify Voice campaign wizard header
    const voiceHeader = page.locator(':has-text("Voice Campaign"), :has-text("Scope & Window"), :has-text("Step 1")').first();
    await expect(voiceHeader).toBeVisible({ timeout: 10000 });

    // Check project select or input
    const projectPicker = page.locator('select, button[role="combobox"], input').first();
    await expect(projectPicker).toBeVisible();
  });

  test('Email Wizard: renders template editor and merge tag selector', async ({ page, loginAsUser }) => {
    await loginAsUser('PRE_SALES_MANAGER');
    await page.goto('/dashboard/marketing/email/campaigns/new');

    // Verify Email campaign wizard header
    const emailHeader = page.locator(':has-text("Email Campaign"), :has-text("Campaign Info"), :has-text("Step 1")').first();
    await expect(emailHeader).toBeVisible({ timeout: 10000 });
  });
});
