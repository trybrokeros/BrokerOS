import { prismaClient as prisma } from '@brokeros/prisma';

async function probeElevenLabs() {
  console.log('====================================================');
  console.log('🔍 PROBING ELEVENLABS LIVE REST API ENDPOINTS');
  console.log('====================================================\n');

  let key = process.env.ELEVENLABS_API_KEY || '';

  if (!key) {
    const integration = await prisma.voiceAgentIntegration.findFirst({
      where: { platform: 'ELEVENLABS', isActive: true },
    });
    if (integration) {
      key = integration.apiKey;
      console.log('🔑 Found ElevenLabs API key in database integration.');
    }
  } else {
    console.log('🔑 Found ElevenLabs API key in process.env.');
  }

  if (!key) {
    console.log('❌ No ELEVENLABS API key found in db or .env.');
    return;
  }

  console.log(`Key preview: ${key.slice(0, 6)}...${key.slice(-4)}\n`);

  const endpoints = [
    { name: '1. User Account (GET /v1/user)', url: 'https://api.elevenlabs.io/v1/user' },
    { name: '2. Voices List (GET /v1/voices)', url: 'https://api.elevenlabs.io/v1/voices' },
    { name: '3. Models List (GET /v1/models)', url: 'https://api.elevenlabs.io/v1/models' },
    { name: '4. ConvAI Agents (GET /v1/convai/agents)', url: 'https://api.elevenlabs.io/v1/convai/agents' },
  ];

  for (const ep of endpoints) {
    console.log(`📡 Testing ${ep.name}...`);
    try {
      const res = await fetch(ep.url, {
        method: 'GET',
        headers: { 'xi-api-key': key },
      });

      console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (ep.url.includes('/v1/voices')) {
          const voices = data.voices || [];
          console.log(`   ✅ Total Live Voices: ${voices.length}`);
          if (voices.length > 0) {
            console.log('   Sample Voices:');
            voices.slice(0, 5).forEach((v: any) => {
              console.log(`     - [${v.voice_id}] ${v.name} (${v.category}, gender: ${v.labels?.gender || 'N/A'}) - Audio: ${v.preview_url ? 'Yes' : 'No'}`);
            });
          }
        } else if (ep.url.includes('/v1/convai/agents')) {
          const agents = Array.isArray(data) ? data : data.agents || [];
          console.log(`   ✅ Total ConvAI Agents: ${agents.length}`);
        } else if (ep.url.includes('/v1/user')) {
          console.log(`   ✅ Subscription Tier: ${data.subscription?.tier || 'free'} | Characters: ${data.subscription?.character_count} / ${data.subscription?.character_limit}`);
        } else if (ep.url.includes('/v1/models')) {
          console.log(`   ✅ Models Available: ${Array.isArray(data) ? data.length : 0}`);
        }
      } else {
        const errText = await res.text();
        console.log(`   ❌ Response: ${errText.slice(0, 200)}`);
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err?.message}`);
    }
    console.log('');
  }
}

probeElevenLabs().catch(console.error);
