import { VoiceAudioService } from '../../../apps/api/src/marketing/voice/services/voice-audio.service.js';

async function testAudioService() {
  console.log('Testing VoiceAudioService with Sarvam and ElevenLabs...');

  const service = new VoiceAudioService();

  // Test 1: Sarvam Bulbul v3 with Priya
  console.log('\n--- 1. Testing Sarvam Priya ---');
  try {
    const res1 = await service.previewTtsAudio({
      text: 'Namaste! Skyline Realty mein aapka swagat hai.',
      voiceId: 'priya',
      voiceProvider: 'sarvam',
    });
    console.log(`✅ Sarvam TTS generated ${res1.audioBuffer?.length || 0} bytes of ${res1.contentType}`);
  } catch (e: any) {
    console.log(`❌ Sarvam TTS error: ${e?.message}`);
  }


  // Test 2: Sarvam Bulbul v3 with Rahul
  console.log('\n--- 2. Testing Sarvam Rahul ---');
  try {
    const res2 = await service.previewTtsAudio({
      text: 'Namaste sir! Main Rahul bol raha hoon luxury apartments ke silsile mein.',
      voiceId: 'rahul',
      voiceProvider: 'Sarvam AI',
    });
    console.log(`✅ Sarvam TTS generated ${res2.audioBuffer?.length || 0} bytes of ${res2.contentType}`);
  } catch (e: any) {
    console.log(`❌ Sarvam TTS error: ${e?.message}`);
  }
}

testAudioService().catch(console.error);
