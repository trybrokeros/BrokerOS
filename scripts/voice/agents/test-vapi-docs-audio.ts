async function testVapiSampleAudios() {
  const samples = [
    { name: 'Elliot', url: 'https://docs.vapi.ai/static/audio/elliot-sample.wav' },
    { name: 'Savannah', url: 'https://docs.vapi.ai/static/audio/savannah-sample.wav' },
    { name: 'Emma', url: 'https://docs.vapi.ai/static/audio/emma-sample.wav' },
    { name: 'Clara', url: 'https://docs.vapi.ai/static/audio/clara-sample.wav' },
    { name: 'Nico', url: 'https://docs.vapi.ai/static/audio/nico-sample.wav' },
    { name: 'Kai', url: 'https://docs.vapi.ai/static/audio/kai-sample.wav' },
    { name: 'Sagar', url: 'https://docs.vapi.ai/static/audio/sagar-sample.wav' },
    { name: 'Godfrey', url: 'https://docs.vapi.ai/static/audio/godfrey-sample.wav' },
    { name: 'Neil', url: 'https://docs.vapi.ai/static/audio/neil-sample.wav' },
    { name: 'Layla', url: 'https://docs.vapi.ai/static/audio/layla-sample.wav' },
    { name: 'Sid', url: 'https://docs.vapi.ai/static/audio/sid-sample.wav' },
    { name: 'Naina', url: 'https://docs.vapi.ai/static/audio/naina-sample.wav' },
  ];

  console.log('Testing Vapi Docs audio samples:');
  for (const s of samples) {
    try {
      const res = await fetch(s.url, { method: 'HEAD' });
      console.log(`  ${res.status === 200 ? '✅' : '❌'} ${s.name}: HTTP ${res.status}`);
    } catch (e: any) {
      console.log(`  ❌ ${s.name}: ${e?.message}`);
    }
  }
}

testVapiSampleAudios();
