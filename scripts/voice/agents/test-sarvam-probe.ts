import { prismaClient as prisma } from '@brokeros/prisma';

async function probeSarvam() {
  console.log('====================================================');
  console.log('🔍 PROBING SARVAM AI LIVE REST API ENDPOINTS');
  console.log('====================================================\n');

  let key = process.env.SARVAM_API_KEY || '';

  if (!key) {
    const integration = await prisma.voiceAgentIntegration.findFirst({
      where: { platform: 'SARVAM', isActive: true },
    });
    if (integration) key = integration.apiKey;
  }

  if (!key) {
    console.log('ℹ️ No SARVAM_API_KEY set in .env or database yet.');
    console.log('👉 To test live Sarvam Bulbul v3 TTS, add SARVAM_API_KEY="your_key" to root .env');
    return;
  }

  console.log(`🔑 Testing with Sarvam key preview: ${key.slice(0, 6)}...${key.slice(-4)}\n`);

  // 1. Test List Models
  console.log('📡 Testing 1. List Models (GET https://api.sarvam.ai/v2/models)...');
  try {
    const res = await fetch('https://api.sarvam.ai/v2/models', {
      headers: { 'api-subscription-key': key },
    });
    console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = (await res.json()) as any;
      console.log(`   ✅ Available models count: ${data.data?.length || 0}`);
      console.log('   Models:', data.data?.map((m: any) => m.id).join(', '));
    } else {
      const err = await res.text();
      console.log(`   ❌ Error: ${err}`);
    }
  } catch (e: any) {
    console.log(`   ❌ Exception: ${e?.message}`);
  }

  console.log('');

  // 2. Test Text-to-Speech (Bulbul v3)
  console.log('📡 Testing 2. Bulbul v3 TTS (POST https://api.sarvam.ai/text-to-speech)...');
  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Namaste! Welcome to BrokerOS luxury real estate platform.',
        language_code: 'hi-IN',
        speaker: 'priya',
        model: 'bulbul:v3',
        speech_sample_rate: 24000,
        output_audio_codec: 'mp3',
      }),
    });
    console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.audios?.[0]) {
        const buf = Buffer.from(data.audios[0], 'base64');
        console.log(`   ✅ Generated MP3 audio! Size: ${buf.byteLength} bytes`);
      }
    } else {
      const err = await res.text();
      console.log(`   ❌ Error: ${err}`);
    }
  } catch (e: any) {
    console.log(`   ❌ Exception: ${e?.message}`);
  }
}

probeSarvam().catch(console.error);
