import 'dotenv/config';
import crypto from 'crypto';

const AWS_REGION = process.env.AWS_SES_REGION || '';
const AWS_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || '';
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || '';
const FROM_NAME = process.env.AWS_SES_FROM_NAME || '';
const TO_EMAIL = process.env.TEST_TO_EMAIL || 'sumamakhan800@gmail.com';

function signAwsRequest(
  method: string,
  pathname: string,
  body: string,
  service: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
) {
  const host = `email.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';

  const canonicalRequest = `${method}\n${pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')}`;

  const kDate = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `https://${host}${pathname}`,
    headers: {
      'Content-Type': 'application/json',
      'Host': host,
      'x-amz-date': amzDate,
      'Authorization': authorizationHeader,
    },
  };
}

async function testAwsDispatch() {
  console.log('==========================================');
  console.log('Sending Test Email via AWS SES v2 API');
  console.log(`From:   ${FROM_EMAIL}`);
  console.log(`To:     ${TO_EMAIL}`);
  console.log(`Region: ${AWS_REGION}`);
  console.log('==========================================\n');

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing AWS_SES_ACCESS_KEY_ID or AWS_SES_SECRET_ACCESS_KEY in environment variables.');
    return;
  }

  const payload = {
    FromEmailAddress: `${FROM_NAME} <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [TO_EMAIL],
    },
    Content: {
      Simple: {
        Subject: {
          Data: '🚀 BrokerOS Marketing Test via Amazon SES (Mumbai)',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f172a; margin-top: 0;">🎉 Amazon SES Integration Test</h2>
                <p>Hello Sumama,</p>
                <p>This is a live test email sent directly from <strong>BrokerOS CRM</strong> using your verified domain <strong>instance.sale</strong> through <strong>Amazon Simple Email Service (SES)</strong>.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 13px; color: #475569;">
                    <strong>Provider:</strong> Amazon SES (ap-south-1 Mumbai)<br/>
                    <strong>Sender Identity:</strong> Shift Consultant &lt;${FROM_EMAIL}&gt;<br/>
                    <strong>Recipient:</strong> ${TO_EMAIL}<br/>
                    <strong>Timestamp:</strong> ${new Date().toISOString()}
                  </p>
                </div>
                <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
                  BrokerOS Enterprise Real Estate CRM · Automated Marketing Engine
                </p>
              </div>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    },
  };

  const bodyString = JSON.stringify(payload);
  const signed = signAwsRequest('POST', '/v2/email/outbound-emails', bodyString, 'ses', AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);

  try {
    const res = await fetch(signed.url, {
      method: 'POST',
      headers: signed.headers,
      body: bodyString,
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json().catch(() => ({}));
    console.log('Response Payload:', JSON.stringify(data, null, 2));

    if (res.status === 200) {
      console.log('\n✅ SUCCESS! Amazon SES accepted the email for delivery.');
      console.log(`Message ID: ${data?.MessageId || 'Generated'}`);
    } else {
      console.error('\n❌ FAILED! Amazon SES returned an error.');
    }
  } catch (err: any) {
    console.error('Error connecting to Amazon SES:', err.message);
  }
}

testAwsDispatch();
