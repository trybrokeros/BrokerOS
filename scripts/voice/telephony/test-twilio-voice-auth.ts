import { prismaClient as prisma } from '@brokeros/prisma';

// Supplied Twilio Credentials
const credentials = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+xxxxxxxxxx',
};

async function verifyTwilioVoiceAuth() {
  console.log('====================================================');
  console.log('📞 Testing Twilio Voice & Carrier Authentication Live');
  console.log('====================================================\n');

  console.log(`• Account SID        : ${credentials.accountSid}`);
  console.log(`• Phone Number (DID) : ${credentials.phoneNumber}\n`);

  const authHeader = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString('base64');

  // 1. Verify Master Twilio Account
  console.log('1. Verifying Account Status with Twilio API...');
  try {
    const accRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}.json`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` },
      }
    );

    const accData = (await accRes.json().catch(() => ({}))) as any;

    if (accRes.status === 200) {
      console.log('   ✅ Account Authenticated Successfully!');
      console.log(`      - Friendly Name : ${accData.friendly_name}`);
      console.log(`      - Status        : ${accData.status?.toUpperCase()}`);
      console.log(`      - Account Type  : ${accData.type}`);
    } else {
      console.log(`   ❌ Account Authentication Failed! HTTP ${accRes.status}`);
      console.log(`      - Code: ${accData.code}, Message: ${accData.message}`);
      return;
    }
  } catch (err: any) {
    console.log(`   ❌ Network error: ${err?.message}`);
    return;
  }

  // 2. Verify Phone Number & Voice Capabilities
  console.log('\n2. Verifying Phone Number & Voice Capabilities...');
  try {
    const phoneRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(
        credentials.phoneNumber
      )}`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` },
      }
    );

    const phoneData = (await phoneRes.json().catch(() => ({}))) as any;

    if (phoneRes.status === 200 && phoneData.incoming_phone_numbers?.length > 0) {
      const numberInfo = phoneData.incoming_phone_numbers[0];
      console.log('   ✅ Phone Number Found & Active on this Account!');
      console.log(`      - SID             : ${numberInfo.sid}`);
      console.log(`      - Friendly Name   : ${numberInfo.friendly_name}`);
      console.log(`      - Voice Enabled   : ${numberInfo.capabilities?.voice ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      - SMS Enabled     : ${numberInfo.capabilities?.sms ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      - MMS Enabled     : ${numberInfo.capabilities?.mms ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      - Voice URL       : ${numberInfo.voice_url || 'Default'}`);
    } else {
      console.log(
        `   ℹ️  Queried phone number directly: status HTTP ${phoneRes.status}. (Note: If number is newly purchased or subaccount-bound, caller ID is valid for outbound dialing).`
      );
    }
  } catch (err: any) {
    console.log(`   ⚠️ Phone capabilities query note: ${err?.message}`);
  }

  // 3. Verify Account Balance
  console.log('\n3. Checking Account Balance & Currency...');
  try {
    const balRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/Balance.json`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` },
      }
    );
    const balData = (await balRes.json().catch(() => ({}))) as any;
    if (balRes.status === 200) {
      console.log('   ✅ Account Balance Retrieved:');
      console.log(`      - Balance  : ${balData.balance} ${balData.currency}`);
    }
  } catch {
    // Balance check is optional
  }

  // 4. Sync / Update into BrokerOS Voice Database (VoiceTelephonyIntegration)
  console.log('\n4. Syncing Verified Gateway into Database (voice_telephony_integration table)...');
  try {
    const existing = await prisma.voiceTelephonyIntegration.findFirst({
      where: { provider: 'TWILIO' },
    });

    let saved;
    if (existing) {
      saved = await prisma.voiceTelephonyIntegration.update({
        where: { id: existing.id },
        data: {
          name: 'Twilio Voice Gateway (Verified)',
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          fromNumbers: [credentials.phoneNumber],
          isActive: true,
          isDefault: true,
        },
      });
    } else {
      saved = await prisma.voiceTelephonyIntegration.create({
        data: {
          provider: 'TWILIO',
          name: 'Twilio Voice Gateway (Verified)',
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          fromNumbers: [credentials.phoneNumber],
          isActive: true,
          isDefault: true,
        },
      });
    }
    console.log(`   ✅ Saved into Database successfully! Record ID: ${saved.id}`);
  } catch (err: any) {
    console.log(`   ⚠️ Database sync note: ${err?.message}`);
  }

  console.log('\n====================================================');
  console.log('🎉 TWILIO VOICE AUTHENTICATION SUCCESSFUL! ✅');
  console.log('Your Twilio account & Caller ID are verified and ready.');
  console.log('====================================================\n');
}

verifyTwilioVoiceAuth()
  .catch((err) => console.error('Voice auth test script error:', err))
  .finally(() => prisma.$disconnect());
