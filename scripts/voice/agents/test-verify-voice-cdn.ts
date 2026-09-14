import { VOICE_TTS_CATALOG } from '@brokeros/constants';
import { VoiceAudioService } from '../../../apps/api/src/marketing/voice/services/voice-audio.service.js';

async function verifyAllVoicePreviews() {
  console.log('====================================================');
  console.log('🔍 VERIFYING VOICE AUDIO PREVIEWS & NEURAL TTS');
  console.log('====================================================\n');

  console.log(`Total voices in catalog: ${VOICE_TTS_CATALOG.length}\n`);

  // 1. Check all static preview URLs
  console.log('1. Checking Static Audio CDN URLs (HTTP Status):');
  let validUrls = 0;
  let skipped = 0;

  for (const v of VOICE_TTS_CATALOG) {
    const audioUrl = (v as any).sampleAudio || (v as any).previewUrl;
    if (audioUrl) {
      try {
        const res = await fetch(audioUrl, { method: 'HEAD' });
        if (res.status === 200) {
          console.log(`   ✅ [${v.provider.toUpperCase()}] ${v.name}: HTTP 200 OK (${audioUrl.slice(0, 55)}...)`);
          validUrls++;
        } else {
          console.log(`   ❌ [${v.provider.toUpperCase()}] ${v.name}: HTTP ${res.status} (${audioUrl})`);
        }
      } catch (err: any) {
        console.log(`   ⚠️ [${v.provider.toUpperCase()}] ${v.name}: Network Error (${err?.message})`);
      }
    } else {
      console.log(`   ℹ️ [${v.provider.toUpperCase()}] ${v.name}: Uses Dynamic Neural TTS (No static URL)`);
      skipped++;
    }
  }

  console.log(`\nStatic Preview Results: ${validUrls} verified HTTP 200 URLs, ${skipped} dynamic neural voices.\n`);

  // 2. Test Live Dynamic Neural TTS Engine
  console.log('2. Testing Backend VoiceAudioService Neural TTS:');
  const service = new VoiceAudioService();

  const testCases = [
    { name: 'Sarvam Priya (Bulbul v3)', voiceId: 'priya', voiceProvider: 'sarvam', text: 'Namaste! Main Skyline Realty se bol rahi hoon.' },
    { name: 'Deepgram Asteria (Aura)', voiceId: 'aura-asteria-en', voiceProvider: 'deepgram', text: 'Hello! I am calling to confirm your site visit.' },
    { name: 'ElevenLabs Rachel (Friendly Name)', voiceId: 'rachel', voiceProvider: '11labs', text: 'Hello! Following up on your penthouse enquiry.' },
    { name: 'ElevenLabs Adam (UUID)', voiceId: 'pNInz6obpgDQGcFmaJgB', voiceProvider: '11labs', text: 'Good day. Presenting the luxury collection.' },
  ];

  for (const tc of testCases) {
    try {
      const res = await service.previewTtsAudio({
        text: tc.text,
        voiceId: tc.voiceId,
        voiceProvider: tc.voiceProvider,
      });
      const bytes = res.audioBuffer?.length || 0;
      if (bytes > 500) {
        console.log(`   ✅ ${tc.name}: Generated ${bytes} bytes (${res.contentType})`);
      } else {
        console.log(`   ℹ️ ${tc.name}: Returned ${bytes} bytes`);
      }
    } catch (err: any) {
      console.log(`   ⚠️ ${tc.name}: ${err?.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('🏁 VOICE PREVIEW & TTS VERIFICATION COMPLETE');
  console.log('====================================================');
}

verifyAllVoicePreviews().catch(console.error);
