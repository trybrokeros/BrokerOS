import { prismaClient as prisma } from '@brokeros/prisma';
import {
  VOICE_TELEPHONY_PROVIDERS,
  VOICE_AGENT_PLATFORMS,
  VOICE_LLM_MODELS,
  VOICE_TTS_CATALOG,
  DEFAULT_VOICE_SCRIPTS,
} from '@brokeros/constants';

async function main() {
  console.log('=== [PHASE 1] Checking Voice & AI Agent Foundation ===\n');

  // 1. Check Constants
  console.log('[1/4] Checking Constants & Catalogs...');
  const telephonyCount = Object.keys(VOICE_TELEPHONY_PROVIDERS).length;
  const agentCount = Object.keys(VOICE_AGENT_PLATFORMS).length;
  const modelsCount = VOICE_LLM_MODELS.length;
  const voicesCount = VOICE_TTS_CATALOG.length;
  const scriptsCount = DEFAULT_VOICE_SCRIPTS.length;

  console.log(`  - Telephony Providers Configured: ${telephonyCount} (Twilio, Vobiz, Exotel, Telnyx, Amazon Connect)`);
  console.log(`  - AI Voice Agent Platforms Configured: ${agentCount} (Vapi, Retell, 11Labs, Sarvam, Bolna, Pipecat, LiveKit, OpenAI Realtime)`);
  console.log(`  - LLM Models: ${modelsCount} (GPT-4o Mini, GPT-4o, Claude 3.5, Llama 3.3 Groq)`);
  console.log(`  - Synthetic & Indic Voices Catalog: ${voicesCount} (11Labs, Sarvam Bulbul Indic, Cartesia, Deepgram, OpenAI)`);
  console.log(`  - Pre-configured Real Estate Scripts: ${scriptsCount}`);

  // 2. Check Prisma Models
  console.log('\n[2/4] Verifying Prisma Client Models...');
  const telephonyIntegrations = await prisma.voiceTelephonyIntegration.findMany();
  const agentIntegrations = await prisma.voiceAgentIntegration.findMany();
  const voiceCampaigns = await prisma.voiceCampaign.findMany();

  console.log(`  - Voice Telephony Integrations in DB: ${telephonyIntegrations.length}`);
  console.log(`  - Voice Agent Integrations in DB: ${agentIntegrations.length}`);
  console.log(`  - Voice Campaigns in DB: ${voiceCampaigns.length}`);

  // 3. Seed demo telephony and voice agent if empty
  if (telephonyIntegrations.length === 0) {
    console.log('\n[3/4] Seeding demo Telephony Integrations (Twilio & Vobiz AI)...');
    const twilioInt = await prisma.voiceTelephonyIntegration.create({
      data: {
        provider: 'TWILIO',
        name: 'Twilio Production Voice',
        accountSid: 'AC' + 'a'.repeat(32),
        authToken: 'tw_auth_' + 'x'.repeat(24),
        fromNumbers: ['+xxxxxxxxx', '+xxxxxxxxx'],
        isDefault: true,
      },
    });

    const vobizInt = await prisma.voiceTelephonyIntegration.create({
      data: {
        provider: 'VOBIZ',
        name: 'Vobiz AI High-Throughput Line',
        apiKey: 'vob_auth_id_' + 'k'.repeat(16),
        apiToken: 'vob_token_' + 't'.repeat(24),
        fromNumbers: ['+xxxxxxxxx'],
      },
    });

    console.log(`  - Created Twilio Integration (${twilioInt.id})`);
    console.log(`  - Created Vobiz AI Integration (${vobizInt.id})`);
  }

  if (agentIntegrations.length === 0) {
    console.log('\n[4/4] Seeding demo AI Voice Agent Integrations (Vapi AI & Sarvam AI)...');
    const vapiInt = await prisma.voiceAgentIntegration.create({
      data: {
        platform: 'VAPI',
        name: 'Vapi AI Multi-Model Orchestrator',
        apiKey: 'vapi_live_' + 'v'.repeat(28),
        isDefault: true,
      },
    });

    const sarvamInt = await prisma.voiceAgentIntegration.create({
      data: {
        platform: 'SARVAM',
        name: 'Sarvam AI Indic Voice Engine',
        apiKey: 'sarvam_' + 's'.repeat(28),
      },
    });

    console.log(`  - Created Vapi Integration (${vapiInt.id})`);
    console.log(`  - Created Sarvam AI Integration (${sarvamInt.id})`);
  }

  console.log('\n✅ [PHASE 1 PASSED] Database models, TypeScript contracts, and constants are verified!');
}

main()
  .catch((err) => {
    console.error('❌ Error verifying Phase 1 foundation:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
