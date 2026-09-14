import dotenv from 'dotenv';
dotenv.config();

async function testMiniMaxFishInworldEndpoints() {
  console.log('====================================================');
  console.log('🔍 TESTING MINIMAX, FISH AUDIO & INWORLD ENDPOINTS');
  console.log('====================================================\n');

  // 1. MiniMax Tests
  console.log('1. Testing MiniMax Endpoints:');
  const mmKey = process.env.MINIMAX_API_KEY || '';
  console.log(`   Key length: ${mmKey.length}`);

  const mmEndpoints = [
    'https://api.minimaxi.chat/v1/t2a_v2',
    'https://api.minimax.chat/v1/t2a_v2',
    'https://api.minimax.io/v1/t2a_v2',
  ];

  for (const ep of mmEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mmKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'speech-01-turbo',
          text: 'Hello from MiniMax.',
          voice_setting: { voice_id: 'male-qn-qingse', speed: 1.0, vol: 1.0, pitch: 0 },
          audio_setting: { sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1 },
        }),
      });
      console.log(`   [${ep}] Status: HTTP ${res.status}`);
      const data = await res.json();
      console.log('   Response:', JSON.stringify(data).slice(0, 120));
    } catch (e: any) {
      console.log(`   Exception on ${ep}:`, e?.message);
    }
  }

  // 2. Fish Audio Tests
  console.log('\n2. Testing Fish Audio:');
  const fishKey = process.env.FISH_AUDIO_API_KEY || '';
  console.log(`   Key length: ${fishKey.length}`);
  try {
    const res = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${fishKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello from Fish Audio.',
        format: 'mp3',
      }),
    });
    console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      console.log(`   🎉 Success! Generated ${buf.byteLength} bytes MP3!`);
    } else {
      const err = await res.text();
      console.log('   Response:', err.slice(0, 150));
    }
  } catch (e: any) {
    console.log('   Exception:', e?.message);
  }

  // 3. Inworld Tests
  console.log('\n3. Testing Inworld:');
  const inworldKey = process.env.INWORLD_API_KEY || '';
  console.log(`   Key length: ${inworldKey.length}`);

  const inworldEndpoints = [
    'https://api.inworld.ai/v1/tts',
    'https://studio.inworld.ai/v1/tts',
    'https://api.inworld.ai/v1/characters',
    'https://studio.inworld.ai/v1/characters',
  ];

  for (const ep of inworldEndpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          Authorization: `Bearer ${inworldKey}`,
        },
      });
      console.log(`   [${ep}] Status: HTTP ${res.status} ${res.statusText}`);
    } catch (e: any) {
      console.log(`   Exception on ${ep}:`, e?.message);
    }
  }
}

testMiniMaxFishInworldEndpoints().catch(console.error);
