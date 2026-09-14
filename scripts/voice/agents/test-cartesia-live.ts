import { VoiceAudioService } from '../../../apps/api/src/marketing/voice/services/voice-audio.service.js';

async function testCartesiaLiveTts() {
  console.log('Testing Cartesia Live Dynamic TTS in VoiceAudioService...');
  const service = new VoiceAudioService();

  const testCases = [
    { name: 'Cartesia Sarah (Direct ID)', voiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091', voiceProvider: 'cartesia', text: 'Hello! This is Sarah from Cartesia Sonic 3.5.' },
    { name: 'Cartesia James (Direct ID)', voiceId: '694f9389-aac1-45b6-b726-9d9369183238', voiceProvider: 'cartesia', text: 'Good day. This is James presenting our luxury penthouse suites.' },
    { name: 'Retell Cartesia Sarah (Prefixed)', voiceId: 'cartesia-Sarah', voiceProvider: 'retell', text: 'Hi! Sarah calling from Retell powered by Cartesia.' },
    { name: 'Retell Cartesia James (Prefixed)', voiceId: 'cartesia-James', voiceProvider: 'retell', text: 'Hello! James calling from Retell powered by Cartesia.' },
  ];

  for (const tc of testCases) {
    const res = await service.previewTtsAudio({
      text: tc.text,
      voiceId: tc.voiceId,
      voiceProvider: tc.voiceProvider,
    });
    console.log(`✅ ${tc.name.padEnd(38)}: Generated ${res.audioBuffer?.length || 0} bytes (${res.contentType})`);
  }
}

testCartesiaLiveTts().catch(console.error);
