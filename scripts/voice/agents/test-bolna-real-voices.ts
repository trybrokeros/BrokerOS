import dotenv from 'dotenv';
dotenv.config();

const BOLNA_API_KEY = process.env.BOLNA_API_KEY || '';

async function fetchAllBolnaVoices() {
  console.log('====================================================');
  console.log('🔍 FETCHING ALL REAL BOLNA VOICES FROM BOLNA API');
  console.log('====================================================\n');

  const headers = {
    Authorization: `Bearer ${BOLNA_API_KEY}`,
    'Content-Type': 'application/json',
  };

  // 1. Get All TTS Providers from Bolna
  console.log('1. Fetching TTS Providers from Bolna (/api/v1/voice-config/tts)...');
  const provRes = await fetch('https://api.bolna.ai/api/v1/voice-config/tts', { headers });
  const provData = (await provRes.json()) as any;

  if (!provData.providers || !Array.isArray(provData.providers)) {
    console.log('❌ Could not fetch providers:', provData);
    return;
  }

  console.log(`✅ Found ${provData.providers.length} TTS Providers in Bolna!\n`);

  let totalVoicesFound = 0;
  const collectedVoices: any[] = [];

  // 2. For each provider, fetch their voices using /api/v1/voice-config/tts/voices
  for (const prov of provData.providers) {
    if (!prov.models || prov.models.length === 0) continue;

    const defaultModel = prov.models.find((m: any) => m.default) || prov.models[0];
    console.log(`Fetching voices for [${prov.name}] (Model: ${defaultModel.display_name}, id: ${defaultModel.id})...`);

    try {
      const url = `https://api.bolna.ai/api/v1/voice-config/tts/voices?provider_id=${prov.id}&model_id=${defaultModel.id}&page_size=20`;
      const vRes = await fetch(url, { headers });
      if (vRes.ok) {
        const vData = (await vRes.json()) as any;
        const items = vData.items || [];
        console.log(`   ✅ ${prov.name}: Got ${items.length} voices.`);
        for (const item of items.slice(0, 3)) {
          console.log(`      * ${item.name} (${item.gender}, voice_id: ${item.voice_id}, preview: ${item.preview_url ? 'YES' : 'NO'})`);
          collectedVoices.push({
            id: item.voice_id || item.id,
            name: `${item.name} (${prov.name})`,
            provider: prov.name.toLowerCase(),
            accent: item.accent || 'Indic',
            gender: item.gender === 'female' ? 'Female' : 'Male',
            previewUrl: item.preview_url,
          });
        }
        totalVoicesFound += items.length;
      } else {
        console.log(`   ❌ ${prov.name} status: ${vRes.status}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Exception for ${prov.name}:`, e?.message);
    }
  }

  console.log(`\n====================================================`);
  console.log(`🏁 Total voices available across Bolna: ${totalVoicesFound}`);
  console.log(`====================================================`);
}

fetchAllBolnaVoices().catch(console.error);
