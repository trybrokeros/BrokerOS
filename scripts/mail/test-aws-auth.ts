import 'dotenv/config';
import crypto from 'crypto';
import { prismaClient as prisma } from '@brokeros/prisma';

const AWS_REGION = process.env.AWS_SES_REGION || '';
const AWS_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY || '';
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || '';
const FROM_NAME = process.env.AWS_SES_FROM_NAME || '';

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

async function testAwsAuth() {
  console.log('==========================================');
  console.log('Testing AWS SES Authentication & Identities');
  console.log(`Region:     ${AWS_REGION} (Asia Pacific - Mumbai)`);
  console.log(`Access Key: ${AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : '(Not Set)'}`);
  console.log(`Sender:     ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log('==========================================\n');

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing AWS_SES_ACCESS_KEY_ID or AWS_SES_SECRET_ACCESS_KEY.');
    console.error('Please pass them in your root .env or export them in your terminal.');
    return;
  }

  try {
    // 1. Check Account Details (Quota & Sandbox status)
    console.log('1. Checking AWS SES Account Status (GET /v2/email/account)...');
    const accountSigned = signAwsRequest('GET', '/v2/email/account', '', 'ses', AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
    const accountRes = await fetch(accountSigned.url, {
      method: 'GET',
      headers: accountSigned.headers,
    });

    console.log(`Account Status: ${accountRes.status} ${accountRes.statusText}`);
    const accountData = await accountRes.json();
    console.log('Account Details:', JSON.stringify(accountData, null, 2));

    // 2. Check Verified Email Identities & Domains
    console.log('\n2. Checking Verified Identities (GET /v2/email/identities)...');
    const identitiesSigned = signAwsRequest('GET', '/v2/email/identities', '', 'ses', AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
    const identitiesRes = await fetch(identitiesSigned.url, {
      method: 'GET',
      headers: identitiesSigned.headers,
    });

    console.log(`Identities Status: ${identitiesRes.status} ${identitiesRes.statusText}`);
    const identitiesData = await identitiesRes.json();
    console.log('Verified Identities:', JSON.stringify(identitiesData, null, 2));

    if (accountRes.status === 200) {
      console.log('\n✅ AWS SES Authentication is 100% VALID & FUNCTIONAL!');

      // 3. Sync to Database
      console.log('\n3. Syncing Verified Credentials to PostgreSQL (marketing_integration table)...');
      try {
        const existing = await prisma.marketingIntegration.findFirst({
          where: { provider: 'AWS_SES' },
        });

        let saved;
        if (existing) {
          saved = await prisma.marketingIntegration.update({
            where: { id: existing.id },
            data: {
              name: 'AWS SES Mumbai',
              awsAccessKeyId: AWS_ACCESS_KEY_ID,
              awsSecretKey: AWS_SECRET_ACCESS_KEY,
              awsRegion: AWS_REGION,
              fromEmail: FROM_EMAIL,
              fromName: FROM_NAME,
              isActive: true,
              isDefault: true,
            },
          });
        } else {
          saved = await prisma.marketingIntegration.create({
            data: {
              provider: 'AWS_SES',
              name: 'AWS SES Mumbai',
              awsAccessKeyId: AWS_ACCESS_KEY_ID,
              awsSecretKey: AWS_SECRET_ACCESS_KEY,
              awsRegion: AWS_REGION,
              fromEmail: FROM_EMAIL,
              fromName: FROM_NAME,
              isActive: true,
              isDefault: true,
            },
          });
        }
        console.log(`   ✅ Successfully saved into Database! Record ID: ${saved.id}`);
      } catch (dbErr: any) {
        console.log(`   ⚠️ Database save note: ${dbErr?.message}`);
      }
    } else {
      console.error('\n❌ AWS SES returned an authentication or permission error.');
    }
  } catch (err: any) {
    console.error('Error connecting to AWS SES:', err.message);
  }
}

testAwsAuth()
  .finally(() => prisma.$disconnect());
