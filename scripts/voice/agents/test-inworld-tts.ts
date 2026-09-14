import dotenv from 'dotenv';
dotenv.config();

async function testInworldTts() {
  console.log('Testing Inworld TTS Endpoints...');
  const key = process.env.INWORLD_API_KEY || '';
  console.log('Key length:', key.length);

  // Inworld TTS endpoints
  const endpoints = [
    'https://api.inworld.ai/v1/tts',
    'https://api.inworld.ai/studio/v1/tts',
    'https://api.inworld.ai/v1/voices',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          Authorization: `Basic ${key}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`[Basic] ${ep}: HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log('Response:', text.slice(0, 150));
    } catch (e: any) {
      console.log(`Exception on ${ep}:`, e.message);
    }
  }

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`[Bearer] ${ep}: HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log('Response:', text.slice(0, 150));
    } catch (e: any) {
      console.log(`Exception on ${ep}:`, e.message);
    }
  }
}

testInworldTts().catch(console.error);
