const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

async function findWorkingVoices() {
  const res = await fetch('https://api.retellai.com/list-voices', {
    headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
  });
  const voices = (await res.json()) as any[];

  const workingMale: any[] = [];
  const workingFemale: any[] = [];

  for (const v of voices) {
    if (!v.preview_audio_url) continue;
    try {
      const head = await fetch(v.preview_audio_url, { method: 'HEAD' });
      if (head.status === 200) {
        if (v.gender?.toLowerCase() === 'male' && workingMale.length < 8) {
          workingMale.push({ name: v.voice_name || v.voice_id, id: v.voice_id, provider: v.provider, accent: v.accent, url: v.preview_audio_url });
        } else if (v.gender?.toLowerCase() === 'female' && workingFemale.length < 8) {
          workingFemale.push({ name: v.voice_name || v.voice_id, id: v.voice_id, provider: v.provider, accent: v.accent, url: v.preview_audio_url });
        }
      }
    } catch { }
    if (workingMale.length >= 8 && workingFemale.length >= 8) break;
  }

  console.log('\n--- VERIFIED WORKING MALE VOICES (HTTP 200) ---');
  console.log(JSON.stringify(workingMale, null, 2));

  console.log('\n--- VERIFIED WORKING FEMALE VOICES (HTTP 200) ---');
  console.log(JSON.stringify(workingFemale, null, 2));
}

findWorkingVoices();
