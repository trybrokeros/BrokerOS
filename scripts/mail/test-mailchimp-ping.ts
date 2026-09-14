import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.MAILCHIMP_API_KEY;

async function testMailchimpPing() {
  if (!API_KEY) {
    console.log('Set MAILCHIMP_API_KEY to test.');
    return;
  }
  const dc = API_KEY.split('-')[1] || 'us1';
  const base64Auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');
  const url = `https://${dc}.api.mailchimp.com/3.0/ping`;

  console.log(`Testing Mailchimp Ping: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64Auth}`,
      },
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const body = await res.text();
    console.log(`Response Body: ${body}`);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testMailchimpPing();

export {};
