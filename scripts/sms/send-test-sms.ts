import dotenv from 'dotenv';
import path from 'path';

// Load root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const targetRecipients = [
  { name: 'US Contact', phone: '+1xxxxxxxxxx' },
  { name: 'India Contact', phone: '+91xxxxxxxx' },
];

async function sendTestSms() {
  console.log('====================================================');
  console.log('🚀 Dispatching Live Test SMS via Twilio');
  console.log('====================================================\n');

  console.log(`• Sender Phone Number : ${fromNumber}`);
  console.log(`• Messaging Service   : ${messagingServiceSid}`);
  console.log(`• Target Numbers (${targetRecipients.length}) : ${targetRecipients.map((r) => r.phone).join(', ')}\n`);

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  for (const recipient of targetRecipients) {
    console.log(`----------------------------------------------------`);
    console.log(`📱 Sending SMS to ${recipient.name} (${recipient.phone})...`);

    const messageBody = `Hello ${recipient.name}! This is a live test broadcast from BrokerOS Real Estate CRM via Twilio. Status: ACTIVE.`;

    const params = new URLSearchParams();
    params.append('To', recipient.phone);
    params.append('Body', messageBody);

    // Use Messaging Service SID if present, fallback to From Number
    if (messagingServiceSid) {
      params.append('MessagingServiceSid', messagingServiceSid);
    } else {
      params.append('From', fromNumber);
    }

    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (response.status === 201 || response.status === 200) {
        console.log(`   ✅ SMS Dispatched Successfully!`);
        console.log(`      • Message SID    : ${data.sid}`);
        console.log(`      • Carrier Status : ${data.status?.toUpperCase()} (${data.direction})`);
        console.log(`      • Segments Num   : ${data.num_segments}`);
        console.log(`      • Price / Unit   : ${data.price || 'Pending'} ${data.price_unit || 'USD'}`);
        console.log(`      • Date Created   : ${data.date_created}`);
      } else {
        console.log(`   ❌ Failed to send to ${recipient.phone} (HTTP ${response.status})`);
        console.log(`      • Error Code     : ${data.code}`);
        console.log(`      • Error Message  : ${data.message}`);
        console.log(`      • More Info      : ${data.more_info || 'https://www.twilio.com/docs/errors'}`);

        if (data.code === 21608) {
          console.log(`\n      💡 Note for Twilio Trial Accounts:`);
          console.log(`         Twilio trial accounts can only send SMS to "Verified Caller IDs".`);
          console.log(`         Go to Twilio Console -> Phone Numbers -> Manage -> Verified Caller IDs -> Add ${recipient.phone}`);
        }
      }
    } catch (err: any) {
      console.log(`   ❌ Network error: ${err?.message}`);
    }
  }

  console.log(`\n====================================================`);
  console.log(`🏁 Test SMS Execution Complete!`);
  console.log(`====================================================\n`);
}

sendTestSms();
