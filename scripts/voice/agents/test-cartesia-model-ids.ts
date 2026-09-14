import dotenv from 'dotenv';
dotenv.config();

async function testCartesiaModelsWithNewKey() {
  const cartesiaKey = process.env.CARTESIA_API_KEY;
  const models = ['sonic-2024-10-19', 'sonic-preview', 'sonic-multilingual', 'sonic-english', 'sonic'];

  console.log('Testing Cartesia Model IDs with active authorized key:');
  for (const m of models) {
    try {
      const res = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': cartesiaKey!,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: m,
          transcript: 'Hello! This is Cartesia Sonic speech synthesis in action.',
          voice: { mode: 'id', id: 'a0e99841-438c-4a64-b679-ae501e7d6091' },
          output_format: { container: 'mp3', bit_rate: 128000, sample_rate: 44100 },
        }),
      });
      console.log(`   Model [${m}]: HTTP ${res.status} ${res.statusText}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`   🎉 SUCCESS! [${m}] generated ${buf.byteLength} bytes of Cartesia MP3 audio!`);
      } else {
        const err = await res.text();
        console.log(`   ❌ Error: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Exception: ${e?.message}`);
    }
  }
}

testCartesiaModelsWithNewKey().catch(console.error);
