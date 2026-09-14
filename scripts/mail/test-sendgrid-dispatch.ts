import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'jondoe1@example.com';
const TO_EMAIL = 'jondoe2@example.com';

async function testSendGrid() {
  console.log('==========================================');
  console.log('Sending Test Email via SendGrid...');
  console.log(`From: ${FROM_EMAIL}`);
  console.log(`To:   ${TO_EMAIL}`);
  console.log('==========================================\n');

  if (!SENDGRID_API_KEY) {
    console.log('⚠️ Set SENDGRID_API_KEY in .env to test.');
    return;
  }

  const payload = {
    personalizations: [
      {
        to: [{ email: TO_EMAIL, name: 'Sumama Business' }],
        subject: 'BrokerOS Marketing Test via SendGrid',
      },
    ],
    from: {
      email: FROM_EMAIL,
      name: 'Sumama Realtor Team',
    },
    content: [
      {
        type: 'text/html',
        value: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0f172a;">🎉 BrokerOS SendGrid Integration Test</h2>
            <p>Hello,</p>
            <p>This is a live test email sent from <strong>BrokerOS CRM</strong> using your SendGrid API key.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">
              Sent at: ${new Date().toISOString()}<br/>
              From: ${FROM_EMAIL} &rarr; To: ${TO_EMAIL}
            </p>
          </div>
        `,
      },
    ],
  };

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`HTTP Status Code: ${res.status} ${res.statusText}`);
    const messageId = res.headers.get('x-message-id');
    if (messageId) {
      console.log(`SendGrid Message ID: ${messageId}`);
    }

    if (res.status === 202 || res.status === 200) {
      console.log('\n✅ SUCCESS! SendGrid accepted the email for delivery (HTTP 202 Accepted).');
      console.log(`SendGrid delivered to ${TO_EMAIL}.`);
    } else {
      const errorText = await res.text();
      console.log('\n❌ FAILED! SendGrid returned an error:');
      console.log(errorText);
    }
  } catch (err: any) {
    console.error('\n❌ Network or execution error:', err.message);
  }
}

testSendGrid();

export {};
