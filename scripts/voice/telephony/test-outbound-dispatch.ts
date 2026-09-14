import dotenv from 'dotenv';
dotenv.config();

import { prismaClient as prisma } from '@brokeros/prisma';
import { getVoiceAgentProvider } from '../../../integrations/voice/index.js';

async function testDispatchWithSavedCreds() {
  console.log('====================================================');
  console.log('🔍 TESTING STEP 5 DISPATCH WITH LIVE DB CREDENTIALS');
  console.log('====================================================\n');

  const agents = await prisma.voiceAgentIntegration.findMany({ where: { isActive: true } });
  console.log(`Found ${agents.length} Active Voice Integrations in DB:\n`);

  for (const a of agents) {
    console.log(`----------------------------------------------------`);
    console.log(`▶ Testing Platform: [${a.platform}] "${a.name}"`);
    console.log(`----------------------------------------------------`);

    const provider = getVoiceAgentProvider(a.platform as any, {
      apiKey: a.apiKey || undefined,
      orgId: a.orgId || undefined,
      serverUrl: a.serverUrl || undefined,
    });

    const isAuth = await provider.validateCredentials({
      apiKey: a.apiKey || undefined,
      orgId: a.orgId || undefined,
      serverUrl: a.serverUrl || undefined,
    });

    console.log(`* Live Credential Auth: ${isAuth ? '✅ AUTHORIZED' : '❌ FAILED'}`);

    // Test Call Dispatch payload builder
    try {
      const result = await provider.dispatchOutboundCall({
        toPhone: '+14155552671',
        fromNumber: '+14155550199',
        campaignId: 'test_step5_preview',
        llmModel: 'gpt-4o-mini',
        voiceProvider: a.platform.toLowerCase(),
        voiceId: 'iWNf11sz1GrUE4ppxTOL',
        scriptPrompt: 'You are an intelligent real estate sales advisor.',
        firstMessage: 'Hello, this is a test call from Skyline Realty.',
      }, {
        apiKey: a.apiKey || undefined,
        orgId: a.orgId || undefined,
        serverUrl: a.serverUrl || undefined,
      });

      console.log(`* Outbound Dispatch Test Result:`, result);
    } catch (e: any) {
      console.log(`* Dispatch Exception:`, e?.message);
    }
    console.log('\n');
  }

  console.log('====================================================');
  console.log('🏁 STEP 5 DISPATCH VERIFICATION COMPLETE');
  console.log('====================================================');
}

testDispatchWithSavedCreds().catch(console.error);
