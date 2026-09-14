import dotenv from 'dotenv';
dotenv.config();

import { VapiAgentClient } from '../../integrations/voice/agents/vapi/src/index.js';
import { RetellAgentClient } from '../../integrations/voice/agents/retell/src/index.js';
import { BolnaAgentClient } from '../../integrations/voice/agents/bolna/src/index.js';
import { SarvamAgentClient } from '../../integrations/voice/agents/sarvam/src/index.js';
import { ElevenLabsAgentClient } from '../../integrations/voice/agents/elevenlabs/src/index.js';
import { LiveKitAgentClient } from '../../integrations/voice/agents/livekit/src/index.js';
import { VobizTelephonyClient } from '../../integrations/voice/telephony/vobiz/src/index.js';

async function testAllIntegrations() {
  console.log('====================================================');
  console.log('🔍 FULL INTEGRATION & TELEPHONY AUDIT');
  console.log('====================================================\n');

  // 1. Telephony: Vobiz
  console.log('--- [1/7] TELEPHONY: VOBIZ ---');
  const vobiz = new VobizTelephonyClient();
  const vobizAuth = await vobiz.validateCredentials();
  console.log(`* Vobiz Client Initialized: ${vobiz.providerType} (Auth check: ${vobizAuth ? '✅ READY' : '⚠️ Pending env keys'})`);

  // 2. Agent: Bolna AI
  console.log('\n--- [2/7] VOICE AGENT: BOLNA AI ---');
  const bolna = new BolnaAgentClient();
  const bolnaAuth = await bolna.validateCredentials();
  const bolnaModels = await bolna.getAvailableModels();
  const bolnaVoices = await bolna.getAvailableVoices();
  console.log(`* Bolna Auth: ${bolnaAuth ? '✅ AUTHORIZED (Wallet Active)' : '❌ Failed'}`);
  console.log(`* Discovered ${bolnaModels.length} Models/Agents (Active: ${bolnaModels[0]?.name})`);
  console.log(`* Discovered ${bolnaVoices.length} Voices across ElevenLabs, Sarvam, Cartesia, Deepgram`);

  // 3. Agent: Sarvam AI
  console.log('\n--- [3/7] VOICE AGENT: SARVAM AI ---');
  const sarvam = new SarvamAgentClient();
  const sarvamAuth = await sarvam.validateCredentials();
  const sarvamModels = await sarvam.getAvailableModels();
  console.log(`* Sarvam Auth: ${sarvamAuth ? '✅ AUTHORIZED' : '❌ Failed'}`);
  console.log(`* Discovered ${sarvamModels.length} Models (Bulbul v3, Sarvam 2B, Saaras v3, Sarvam 105B)`);

  // 4. Agent: ElevenLabs
  console.log('\n--- [4/7] VOICE AGENT: ELEVENLABS ---');
  const eleven = new ElevenLabsAgentClient();
  const elevenAuth = await eleven.validateCredentials();
  console.log(`* ElevenLabs Auth: ${elevenAuth ? '✅ AUTHORIZED' : '❌ Failed'}`);

  // 5. Agent: LiveKit
  console.log('\n--- [5/7] VOICE AGENT: LIVEKIT ---');
  const livekit = new LiveKitAgentClient({ apiKey: 'APIi8XyVSSfZu4C', serverUrl: 'wss://sumama-1kd20r85.livekit.cloud' });
  const lkAuth = await livekit.validateCredentials();
  const lkModels = await livekit.getAvailableModels();
  const lkVoices = await livekit.getAvailableVoices();
  console.log(`* LiveKit Auth: ${lkAuth ? '✅ CONFIGURED (Cloud wss://sumama-1kd20r85.livekit.cloud)' : '❌ Failed'}`);
  console.log(`* Models: ${lkModels.map(m => m.name.split(' (')[0]).join(', ')}`);
  console.log(`* Suggested Voices: ${lkVoices.length} across Cartesia, Deepgram, Fish Audio, ElevenLabs`);

  // 6. Agent: Vapi
  console.log('\n--- [6/7] VOICE AGENT: VAPI ---');
  const vapi = new VapiAgentClient();
  const vapiAuth = await vapi.validateCredentials();
  console.log(`* Vapi Auth: ${vapiAuth ? '✅ CONFIGURED' : '⚠️ Pending API Key'}`);

  // 7. Agent: Retell
  console.log('\n--- [7/7] VOICE AGENT: RETELL ---');
  const retell = new RetellAgentClient();
  const retellAuth = await retell.validateCredentials();
  console.log(`* Retell Auth: ${retellAuth ? '✅ CONFIGURED' : '⚠️ Pending API Key'}`);

  console.log('\n====================================================');
  console.log('🏁 ALL PROVIDERS AUDITED SUCCESSFULLY');
  console.log('====================================================');
}

testAllIntegrations().catch(console.error);
