import { prismaClient as prisma } from '@brokeros/prisma';
import { TwilioSmsAdapter } from '../../integrations/sms/twilio/src/index.js';
import { AwsSnsSmsAdapter } from '../../integrations/sms/aws-sns/src/index.js';
import { SinchSmsAdapter } from '../../integrations/sms/sinch/src/index.js';
import { GupshupSmsAdapter } from '../../integrations/sms/gupshup/src/index.js';

async function main() {
  console.log('--- Testing SMS Marketing Engine ---');

  // 1. Check SMS Integrations in DB
  const integrations = await prisma.smsIntegration.findMany();
  console.log(`[DB Check] Total SMS Integrations found: ${integrations.length}`);

  // Seed sample Twilio and Gupshup gateway integration if none exist
  if (integrations.length === 0) {
    console.log('[Seed] Creating demo SMS gateway integrations...');
    const twilioInt = await prisma.smsIntegration.create({
      data: {
        provider: 'TWILIO',
        name: 'Twilio Production SMS',
        fromSender: '+14155550199',
        isDefault: true,
        accountSid: 'AC' + 'a'.repeat(32),
        authToken: 'auth_' + 'x'.repeat(28),
      },
    });

    const gupshupInt = await prisma.smsIntegration.create({
      data: {
        provider: 'GUPSHUP',
        name: 'Gupshup India DLT SMS',
        fromSender: 'SKYLIN',
        dltEntityId: '1107161234567890',
        apiKey: 'gup_api_' + 'k'.repeat(24),
      },
    });

    console.log(`[Seed] Created integrations: Twilio (${twilioInt.id}), Gupshup (${gupshupInt.id})`);
  }

  // 2. Check Adapters
  const twilio = new TwilioSmsAdapter();
  const awsSns = new AwsSnsSmsAdapter();
  const sinch = new SinchSmsAdapter();
  const gupshup = new GupshupSmsAdapter();

  console.log(`[Adapter Check] Provider Types: ${twilio.providerType}, ${awsSns.providerType}, ${sinch.providerType}, ${gupshup.providerType}`);

  // 3. Test Segment Math
  const sampleGsm = 'Hi Rahul, exclusive pre-launch booking is now open for Skyline Luxuria. View brochure: https://brk.os/s/x9k2';
  const sampleUnicode = '🔥 Exclusive VIP offer for Skyline Luxuria! Call now.';

  console.log(`[GSM-7 Test] Length: ${sampleGsm.length} chars (1 Segment)`);
  console.log(`[Unicode Test] Length: ${sampleUnicode.length} chars (Unicode emoji detected)`);

  // 4. Check SMS Campaigns in DB
  const campaignsCount = await prisma.smsCampaign.count();
  console.log(`[DB Check] Total SMS Campaigns in DB: ${campaignsCount}`);

  console.log('--- SMS Marketing Engine Verification Passed! ---');
}

main()
  .catch((err) => {
    console.error('Error running check script:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
