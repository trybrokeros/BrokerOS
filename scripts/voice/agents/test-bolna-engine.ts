import { VoiceAudioService } from '../../../apps/api/src/marketing/voice/services/voice-audio.service.js';
import { BolnaAgentClient } from '../../../integrations/voice/agents/bolna/src/index.js';

async function testBolnaEngine() {
  console.log('====================================================');
  console.log('🔍 TESTING BOLNA AI ENGINE & SYNTHESIS');
  console.log('====================================================\n');

  // 1. Test Bolna Models & Voices discovery
  const client = new BolnaAgentClient();
  const models = await client.getAvailableModels();
  const voices = await client.getAvailableVoices();

  console.log(`1. Discovered ${models.length} Models & Custom Agents in Bolna:`);
  for (const m of models) {
    console.log(`   * [${m.badge}] ${m.name} (id: ${m.id})`);
  }

  console.log(`\n2. Discovered ${voices.length} Voices in Bolna:`);
  for (const v of voices.slice(0, 7)) {
    console.log(`   * ${v.name} | Accent: ${v.accent} | Gender: ${v.gender} | PreviewUrl: ${v.previewUrl ? 'YES' : 'NO'}`);
  }

  // 2. Test Live TTS Synthesis for Bolna voices
  console.log('\n3. Testing Live Neural TTS for Bolna voices in VoiceAudioService:');
  const service = new VoiceAudioService();

  const testCases = [
    { name: 'Viraj (Bolna ElevenLabs Indic)', voiceId: 'iWNf11sz1GrUE4ppxTOL', voiceProvider: 'bolna', text: 'Namaste! Main Skyline Realty team se baat kar raha hoon.' },
    { name: 'Priya (Bolna Sarvam Indic)', voiceId: 'sarvam-priya', voiceProvider: 'bolna', text: 'Namaste ji! Kya aap is weekend property dekhne aa rahe hain?' },
    { name: 'Sarah (Bolna Cartesia)', voiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091', voiceProvider: 'bolna', text: 'Hello, this is Sarah following up on your luxury penthouse selection.' },
    { name: 'Asteria (Bolna Deepgram)', voiceId: 'aura-asteria-en', voiceProvider: 'bolna', text: 'Hello! I am calling to confirm your site visit appointment.' },
  ];

  for (const tc of testCases) {
    try {
      const res = await service.previewTtsAudio({
        text: tc.text,
        voiceId: tc.voiceId,
        voiceProvider: tc.voiceProvider,
      });
      console.log(`   ✅ ${tc.name.padEnd(35)}: Generated ${res.audioBuffer?.length || 0} bytes (${res.contentType})`);
    } catch (e: any) {
      console.log(`   ❌ ${tc.name} Error:`, e?.message);
    }
  }

  console.log('\n====================================================');
  console.log('🏁 BOLNA AI TEST COMPLETE');
  console.log('====================================================');
}

testBolnaEngine().catch(console.error);
