import { prismaClient as prisma } from '@brokeros/prisma';

async function probeCartesia() {
  console.log('====================================================');
  console.log('🔍 PROBING CARTESIA API');
  console.log('====================================================\n');

  const cartesiaKey = process.env.CARTESIA_API_KEY || '';
  console.log(`Cartesia Key exists: ${!!cartesiaKey} (length: ${cartesiaKey.length})`);

  if (!cartesiaKey) {
    console.log('❌ No CARTESIA_API_KEY in process.env');
    return;
  }

  // 1. Test GET /voices
  console.log('\n1. Testing GET https://api.cartesia.ai/voices...');
  try {
    const vRes = await fetch('https://api.cartesia.ai/voices', {
      headers: {
        'X-API-Key': cartesiaKey,
        'Cartesia-Version': '2024-06-10',
      },
    });
    console.log(`   Status: HTTP ${vRes.status} ${vRes.statusText}`);
    const vData = await vRes.json();
    if (vRes.ok) {
      console.log(`   ✅ Success! Found ${Array.isArray(vData) ? vData.length : 0} voices.`);
      if (Array.isArray(vData) && vData.length > 0) {
        console.log('   Sample voices:', vData.slice(0, 3).map((v: any) => `${v.name} (${v.id}, ${v.gender})`));
      }
    } else {
      console.log('   ❌ Error response:', vData);
    }
  } catch (e: any) {
    console.log(`   ❌ Exception: ${e?.message}`);
  }

  // 2. Test POST /tts/bytes
  console.log('\n2. Testing POST https://api.cartesia.ai/tts/bytes...');
  try {
    const tRes = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': cartesiaKey,
        'Cartesia-Version': '2024-06-10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-english',
        transcript: 'Hello! This is Cartesia Sonic real-time voice synthesis.',
        voice: {
          mode: 'id',
          id: 'a0e99841-438c-4a64-b679-ae501e7d6091', // Sarah
        },
        output_format: {
          container: 'mp3',
          bit_rate: 128000,
          sample_rate: 44100,
        },
      }),
    });
    console.log(`   Status: HTTP ${tRes.status} ${tRes.statusText}`);
    if (tRes.ok) {
      const buf = await tRes.arrayBuffer();
      console.log(`   ✅ Success! Generated ${buf.byteLength} bytes of MP3 audio!`);
    } else {
      const errText = await tRes.text();
      console.log(`   ❌ Error response: ${errText}`);
    }
  } catch (e: any) {
    console.log(`   ❌ Exception: ${e?.message}`);
  }
}

probeCartesia().catch(console.error);
