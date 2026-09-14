import dotenv from 'dotenv';
dotenv.config();

async function probeAllKeys() {
  console.log('====================================================');
  console.log('🔍 PROBING ALL VOICE PROVIDER API KEYS');
  console.log('====================================================\n');

  console.log('1. Checking Keys Presence:');
  console.log(`   ELEVENLABS_API_KEY : ${!!process.env.ELEVENLABS_API_KEY} (length: ${process.env.ELEVENLABS_API_KEY?.length || 0})`);
  console.log(`   DEEPGRAM_API_KEY   : ${!!process.env.DEEPGRAM_API_KEY} (length: ${process.env.DEEPGRAM_API_KEY?.length || 0})`);
  console.log(`   CARTESIA_API_KEY   : ${!!process.env.CARTESIA_API_KEY} (length: ${process.env.CARTESIA_API_KEY?.length || 0})`);
  console.log(`   SARVAM_API_KEY     : ${!!process.env.SARVAM_API_KEY} (length: ${process.env.SARVAM_API_KEY?.length || 0})`);
  console.log(`   INWORLD_API_KEY    : ${!!process.env.INWORLD_API_KEY} (length: ${process.env.INWORLD_API_KEY?.length || 0})`);
  console.log(`   MINIMAX_API_KEY    : ${!!process.env.MINIMAX_API_KEY} (length: ${process.env.MINIMAX_API_KEY?.length || 0})`);
  console.log(`   FISH_AUDIO_API_KEY : ${!!process.env.FISH_AUDIO_API_KEY} (length: ${process.env.FISH_AUDIO_API_KEY?.length || 0})`);

  // 1. Test Cartesia
  console.log('\n2. Testing Cartesia:');
  if (process.env.CARTESIA_API_KEY) {
    try {
      const res = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.CARTESIA_API_KEY,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'sonic',
          transcript: 'Hello, this is Cartesia Sonic voice synthesis.',
          voice: { mode: 'id', id: 'a0e99841-438c-4a64-b679-ae501e7d6091' },
          output_format: { container: 'mp3', bit_rate: 128000, sample_rate: 44100 },
        }),
      });
      console.log(`   Cartesia Status: HTTP ${res.status} ${res.statusText}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`   ✅ Cartesia Generated: ${buf.byteLength} bytes MP3!`);
      } else {
        const err = await res.text();
        console.log(`   ❌ Cartesia Error: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Cartesia Exception: ${e?.message}`);
    }
  } else {
    console.log('   ℹ️ No CARTESIA_API_KEY');
  }

  // 2. Test Inworld
  console.log('\n3. Testing Inworld:');
  if (process.env.INWORLD_API_KEY) {
    console.log(`   Inworld Key detected (${process.env.INWORLD_API_KEY.slice(0, 8)}...)`);
    // Inworld API auth format check (Basic or Bearer or ApiKey)
    try {
      const res = await fetch('https://api.inworld.ai/v1/workspaces', {
        headers: {
          Authorization: `Basic ${process.env.INWORLD_API_KEY}`,
        },
      });
      console.log(`   Inworld Basic Auth Status: HTTP ${res.status} ${res.statusText}`);
      if (!res.ok) {
        const res2 = await fetch('https://api.inworld.ai/v1/workspaces', {
          headers: {
            Authorization: `Bearer ${process.env.INWORLD_API_KEY}`,
          },
        });
        console.log(`   Inworld Bearer Auth Status: HTTP ${res2.status} ${res2.statusText}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Inworld Exception: ${e?.message}`);
    }
  } else {
    console.log('   ℹ️ No INWORLD_API_KEY');
  }

  // 3. Test MiniMax
  console.log('\n4. Testing MiniMax:');
  if (process.env.MINIMAX_API_KEY) {
    try {
      const res = await fetch('https://api.minimax.chat/v1/t2a_v2', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'speech-01-turbo',
          text: 'Hello from MiniMax speech synthesis.',
          voice_setting: {
            voice_id: 'male-qn-qingse',
            speed: 1.0,
            vol: 1.0,
            pitch: 0,
          },
          audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: 'mp3',
            channel: 1,
          },
        }),
      });
      console.log(`   MiniMax Status: HTTP ${res.status} ${res.statusText}`);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.data?.audio) {
          console.log(`   ✅ MiniMax Generated Audio! (Hex length: ${data.data.audio.length})`);
        } else {
          console.log('   MiniMax Response:', data);
        }
      } else {
        const err = await res.text();
        console.log(`   ❌ MiniMax Error: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ MiniMax Exception: ${e?.message}`);
    }
  } else {
    console.log('   ℹ️ No MINIMAX_API_KEY');
  }

  // 4. Test Fish Audio
  console.log('\n5. Testing Fish Audio:');
  if (process.env.FISH_AUDIO_API_KEY) {
    try {
      const res = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello from Fish Audio speech synthesis.',
          reference_id: '7f92f8afb8ec43bf81429cc1c9199cb1',
          format: 'mp3',
        }),
      });
      console.log(`   Fish Audio Status: HTTP ${res.status} ${res.statusText}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        console.log(`   ✅ Fish Audio Generated: ${buf.byteLength} bytes MP3!`);
      } else {
        const err = await res.text();
        console.log(`   ❌ Fish Audio Error: ${err}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Fish Audio Exception: ${e?.message}`);
    }
  } else {
    console.log('   ℹ️ No FISH_AUDIO_API_KEY');
  }

  console.log('\n====================================================');
  console.log('🏁 PROBE COMPLETED');
  console.log('====================================================');
}

probeAllKeys().catch(console.error);
