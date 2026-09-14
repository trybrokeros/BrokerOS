import { MetaGraphApiClient } from '../../integrations/ads/meta/src/client.js';
import { prismaClient as prisma } from '@brokeros/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testMetaFullSync() {
  console.log('Testing Meta Full Sync Flow...');

  const integration = await prisma.metaAdIntegration.findFirst({ where: { isActive: true } });
  if (!integration) {
    console.log('No active Meta integration in DB');
    return;
  }

  const client = new MetaGraphApiClient();
  const credentials = {
    adAccountId: integration.adAccountId,
    accessToken: integration.accessToken,
  };

  // 1. Fetch Account Details
  const account = await client.getAccountDetails(credentials);
  console.log('✅ Meta Account Details fetched:', account);

  // 2. Fetch Campaigns
  const campaigns = await client.getCampaigns(credentials);
  console.log(`✅ Fetched ${campaigns.length} Meta campaign(s):`, JSON.stringify(campaigns, null, 2));

  // 3. Save into Database Cache
  for (const camp of campaigns) {
    await prisma.metaCampaignCache.upsert({
      where: { id: camp.id },
      create: {
        id: camp.id,
        integrationId: integration.id,
        name: camp.name,
        objective: camp.objective,
        status: camp.status,
        effectiveStatus: camp.effectiveStatus,
        dailyBudget: camp.dailyBudget,
        lifetimeBudget: camp.lifetimeBudget,
        spend: camp.insights.spend || 0,
        impressions: camp.insights.impressions || 0,
        reach: camp.insights.reach || 0,
        clicks: camp.insights.clicks || 0,
        ctr: camp.insights.ctr || 0,
        cpc: camp.insights.cpc || 0,
        leadsCount: camp.insights.leadsCount || 0,
        costPerLead: camp.insights.costPerLead || 0,
        startTime: camp.startTime ? new Date(camp.startTime) : null,
        stopTime: camp.stopTime ? new Date(camp.stopTime) : null,
        lastSyncedAt: new Date(),
      },
      update: {
        name: camp.name,
        objective: camp.objective,
        status: camp.status,
        effectiveStatus: camp.effectiveStatus,
        dailyBudget: camp.dailyBudget,
        lifetimeBudget: camp.lifetimeBudget,
        spend: camp.insights.spend || 0,
        impressions: camp.insights.impressions || 0,
        reach: camp.insights.reach || 0,
        clicks: camp.insights.clicks || 0,
        ctr: camp.insights.ctr || 0,
        cpc: camp.insights.cpc || 0,
        leadsCount: camp.insights.leadsCount || 0,
        costPerLead: camp.insights.costPerLead || 0,
        lastSyncedAt: new Date(),
      },
    });
  }

  await prisma.metaAdIntegration.update({
    where: { id: integration.id },
    data: { lastSyncedAt: new Date() },
  });

  console.log(`\n🎉 META SYNC COMPLETE! Synced ${campaigns.length} campaign(s) into database.`);
}

testMetaFullSync().finally(() => prisma.$disconnect());
