const vapi_key = process.env.VAPI_API_KEY || '';

async function probeVapiAccount() {
  console.log('===============================================================');
  console.log('🔍 LIVE VAPI API PROBE: Fetching Complete Account Configuration');
  console.log('===============================================================\n');

  const headers = {
    Authorization: `Bearer ${vapi_key}`,
    'Content-Type': 'application/json',
  };

  const endpoints = [
    { name: '1. List Assistants (GET /assistant)', url: 'https://api.vapi.ai/assistant' },
    { name: '2. List Voices (GET /voice)', url: 'https://api.vapi.ai/voice' },
    { name: '3. List Phone Numbers (GET /phone-number)', url: 'https://api.vapi.ai/phone-number' },
    { name: '4. List Files (GET /file)', url: 'https://api.vapi.ai/file' },
    { name: '5. List Tools (GET /tool)', url: 'https://api.vapi.ai/tool' },
  ];

  for (const ep of endpoints) {
    console.log(`📡 Probing ${ep.name}...`);
    try {
      const res = await fetch(ep.url, { headers });
      console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }

      if (res.ok) {
        if (Array.isArray(json)) {
          console.log(`   ✅ Success! Returned array with ${json.length} items.`);
          if (json.length > 0) {
            console.log(`   Sample item:`, JSON.stringify(json[0], null, 2).slice(0, 500) + '...\n');
          } else {
            console.log(`   (Array is empty: 0 items configured)\n`);
          }
        } else {
          console.log(`   ✅ Success! Response:`, JSON.stringify(json, null, 2).slice(0, 500) + '...\n');
        }
      } else {
        console.log(`   ℹ️ Response:`, JSON.stringify(json, null, 2).slice(0, 300) + '\n');
      }
    } catch (err: any) {
      console.log(`   ⚠️ Request failed: ${err?.message}\n`);
    }
  }

  console.log('===============================================================');
  console.log('🏁 VAPI PROBE COMPLETE');
  console.log('===============================================================');
}

probeVapiAccount().catch(console.error);
