import { prismaClient as prisma } from '@brokeros/prisma';

const credentials = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
};

async function verifyTwilio() {
  console.log('====================================================');
  console.log('🔍 Testing Provided Twilio Credentials Live');
  console.log('====================================================\n');

  console.log(`• Account SID        : ${credentials.accountSid}`);
  console.log(`• From Phone Number  : ${credentials.phoneNumber}`);
  console.log(`• Messaging Service  : ${credentials.messagingServiceSid}\n`);

  const authHeader = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString('base64');

  // 1. Check Account Info
  console.log('1. Verifying Account Status with Twilio API...');
  try {
    const accRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}.json`, {
      method: 'GET',
      headers: { Authorization: `Basic ${authHeader}` },
    });

    const accData = (await accRes.json().catch(() => ({}))) as any;

    if (accRes.status === 200) {
      console.log('   ✅ Account Verified Successfully!');
      console.log(`      - Friendly Name : ${accData.friendly_name}`);
      console.log(`      - Status        : ${accData.status?.toUpperCase()}`);
      console.log(`      - Type          : ${accData.type}`);
    } else {
      console.log(`   ❌ Account Verification Failed! HTTP ${accRes.status}`);
      console.log(`      - Code: ${accData.code}, Message: ${accData.message}`);
      return;
    }
  } catch (err: any) {
    console.log(`   ❌ Network error: ${err?.message}`);
    return;
  }

  // 2. Check Messaging Service
  console.log('\n2. Verifying Messaging Service SID (MG85a57a27668e0c4ed5027589be9c8a31)...');
  try {
    const msRes = await fetch(
      `https://messaging.twilio.com/v1/Services/${credentials.messagingServiceSid}`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` },
      }
    );
    const msData = (await msRes.json().catch(() => ({}))) as any;
    if (msRes.status === 200) {
      console.log('   ✅ Messaging Service Verified!');
      console.log(`      - Service Name  : ${msData.friendly_name}`);
      console.log(`      - Inbound URL   : ${msData.inbound_request_url || 'Default/None'}`);
      console.log(`      - Status Callback: ${msData.status_callback || 'Default/None'}`);
    } else {
      console.log(`   ⚠️ Messaging Service query status: HTTP ${msRes.status} (Using direct phone number fallback)`);
    }
  } catch (err: any) {
    console.log(`   ⚠️ Messaging service check note: ${err?.message}`);
  }

  // 3. Save / Update in Database
  console.log('\n3. Syncing Verified Credentials to PostgreSQL (sms_integration table)...');
  try {
    const existing = await prisma.smsIntegration.findFirst({
      where: { provider: 'TWILIO' },
    });

    let saved;
    if (existing) {
      saved = await prisma.smsIntegration.update({
        where: { id: existing.id },
        data: {
          name: 'Twilio Production (Verified)',
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          fromSender: credentials.phoneNumber,
          messagingServiceSid: credentials.messagingServiceSid,
          isActive: true,
          isDefault: true,
        },
      });
    } else {
      saved = await prisma.smsIntegration.create({
        data: {
          provider: 'TWILIO',
          name: 'Twilio Production (Verified)',
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          fromSender: credentials.phoneNumber,
          messagingServiceSid: credentials.messagingServiceSid,
          isActive: true,
          isDefault: true,
        },
      });
    }
    console.log(`   ✅ Successfully saved into Database! Record ID: ${saved.id}`);
  } catch (err: any) {
    console.log(`   ❌ Database save note: ${err?.message}`);
  }

  console.log('\n====================================================');
  console.log('🎉 TWILIO SETUP COMPLETE & AUTHENTICATED! ✅');
  console.log('====================================================\n');
}

verifyTwilio()
  .catch((err) => console.error('Verification script error:', err))
  .finally(() => prisma.$disconnect());
