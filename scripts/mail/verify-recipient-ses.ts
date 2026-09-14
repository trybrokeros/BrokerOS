import 'dotenv/config';
import crypto from 'crypto';

const AWS_REGION = process.env.AWS_SES_REGION || '';
const AWS_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || '';

const EMAIL_TO_VERIFY = process.argv[2] || 'sumamakhan800@gmail.com';

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

async function sendVerification() {
  console.log('====================================================');
  console.log(`Requesting AWS SES Verification for: ${EMAIL_TO_VERIFY}`);
  console.log(`Region: ${AWS_REGION}`);
  console.log('====================================================\n');

  const payload = {
    EmailIdentity: EMAIL_TO_VERIFY,
  };
  const bodyString = JSON.stringify(payload);
  const signed = signAwsRequest(
    'POST',
    '/v2/email/identities',
    bodyString,
    'ses',
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  );

  try {
    const res = await fetch(signed.url, {
      method: 'POST',
      headers: signed.headers,
      body: bodyString,
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json().catch(() => ({}));
    console.log('Response:', JSON.stringify(data, null, 2));

    if (res.status === 200) {
      console.log('\n📧 VERIFICATION EMAIL SENT BY AWS SES!');
      console.log(`👉 Please check the inbox of ${EMAIL_TO_VERIFY} and click the confirmation link sent by Amazon Web Services.`);
      console.log('👉 Once clicked, AWS SES will allow sending emails directly to this address!');
    } else {
      console.error('\n❌ Could not send verification request to AWS SES.');
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

sendVerification();
