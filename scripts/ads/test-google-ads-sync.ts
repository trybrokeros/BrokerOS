import { prismaClient as prisma } from '@brokeros/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runTest() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';

  const integration = await prisma.googleAdIntegration.findFirst({ where: { isActive: true } });
  if (!integration) return;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: integration.refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });
  const tokenData = (await tokenRes.json()) as any;
  const accessToken = tokenData.access_token;

  console.log('Testing Keywords query on v25 for campaign 24216532978...');
  const kwQuery = `
    SELECT
      ad_group_criterion.criterion_id,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      ad_group_criterion.quality_info.quality_score
    FROM keyword_view
    WHERE campaign.id = 24216532978
  `;

  const kwRes = await fetch(`https://googleads.googleapis.com/v25/customers/${integration.customerId}/googleAds:search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': devToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: kwQuery }),
  });

  console.log('Keyword Search Status:', kwRes.status);
  const kwData = await kwRes.json();
  console.log('Keyword Search Response:', JSON.stringify(kwData, null, 2));
}

runTest().finally(() => prisma.$disconnect());
