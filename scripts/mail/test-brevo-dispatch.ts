import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = 'jondoe1@example.com';
const TO_EMAIL = 'jondoe2@example.com';
const FROM_NAME = 'shift consultant';
const TO_NAME = 'Sumama Khan';

async function testBrevoDispatch() {
  console.log('==========================================');
  console.log('Sending Test Email via Brevo API...');
  console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`To:   ${TO_NAME} <${TO_EMAIL}>`);
  console.log('==========================================\n');

  if (!BREVO_API_KEY) {
    console.log('⚠️ Set BREVO_API_KEY in .env to test.');
    return;
  }

  const payload = {
    sender: {
      name: FROM_NAME,
      email: FROM_EMAIL,
    },
    to: [
      {
        name: TO_NAME,
        email: TO_EMAIL,
      },
    ],
    subject: '🚀 BrokerOS Marketing Test via Brevo',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">🎉 Brevo Email Integration Test</h2>
        <p>Hello ${TO_NAME},</p>
        <p>This is a live test email sent directly from <strong>BrokerOS CRM</strong> using your Brevo API credentials.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #475569;">
            <strong>Provider:</strong> Brevo (Sendinblue)<br/>
            <strong>Sender Identity:</strong> ${FROM_NAME} (${FROM_EMAIL})<br/>
            <strong>Recipient:</strong> ${TO_EMAIL}<br/>
            <strong>Timestamp:</strong> ${new Date().toISOString()}
          </p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
          BrokerOS Enterprise Real Estate CRM · Automated Marketing Engine
        </p>
      </div>
    `,
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`HTTP Status Code: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Response Payload:', JSON.stringify(data, null, 2));

    if (res.status === 201 || res.status === 200) {
      console.log('\n✅ SUCCESS! Brevo accepted the email for delivery.');
      console.log(`Message ID: ${data.messageId || 'Generated'}`);
      console.log(`Delivered to: ${TO_EMAIL}`);
    } else {
      console.error('\n❌ FAILED! Brevo returned an error.');
    }
  } catch (err: any) {
    console.error('Error connecting to Brevo:', err);
  }
}

testBrevoDispatch();

export {};
