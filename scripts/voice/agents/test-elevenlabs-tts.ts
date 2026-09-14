import { prismaClient as prisma } from '@brokeros/prisma';

async function testTtsPermission() {
  let key = process.env.ELEVENLABS_API_KEY || '';
  if (!key) {
    const integration = await prisma.voiceAgentIntegration.findFirst({
      where: { platform: 'ELEVENLABS', isActive: true },
    });
    if (integration) key = integration.apiKey;
  }

  console.log('Testing ElevenLabs TTS with current key...');

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello from BrokerOS testing.',
        model_id: 'eleven_flash_v2_5',
      }),
    });

    console.log(`TTS HTTP Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      console.log(`✅ TTS permission is ACTIVE! Generated ${buf.byteLength} bytes of audio.`);
    } else {
      const err = await res.text();
      console.log(`❌ TTS response: ${err}`);
    }
  } catch (e: any) {
    console.log(`❌ Exception: ${e?.message}`);
  }
}

testTtsPermission();
