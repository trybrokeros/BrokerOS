const api_key = process.env.VAPI_API_KEY || '';

const endpoints = [
  { name: 'Assistants', path: '/assistant' },
  { name: 'Credentials (BYO Keys/Providers)', path: '/credential' },
  { name: 'Phone Numbers', path: '/phone-number' },
  { name: 'Tools / Functions', path: '/tool' },
  { name: 'Squads (Multi-agent)', path: '/squad' },
  { name: 'Knowledge Bases', path: '/knowledge-base' },
  { name: 'Files', path: '/file' },
  { name: 'Voices', path: '/voice' },
  { name: 'Models', path: '/model' },
];

async function exploreVapiCatalog() {
  console.log('===============================================================');
  console.log('📡 EXPLORING VAPI API CATALOG ENDPOINTS');
  console.log('===============================================================\n');

  for (const ep of endpoints) {
    try {
      const url = `https://api.vapi.ai${ep.path}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`🔍 [${ep.name}] GET ${ep.path} -> Status: HTTP ${res.status} ${res.statusText}`);

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as any;
        if (Array.isArray(data)) {
          console.log(`   ✅ Returned ${data.length} item(s)`);
          if (data.length > 0) {
            console.log(`   Sample item keys: ${Object.keys(data[0]).slice(0, 10).join(', ')}`);
            console.log(`   First item summary:`, JSON.stringify(data[0], null, 2).slice(0, 300) + '...\n');
          }
        } else {
          console.log(`   ✅ Returned Object with keys:`, Object.keys(data).slice(0, 10).join(', '));
          console.log(`   Preview:`, JSON.stringify(data, null, 2).slice(0, 300) + '...\n');
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as any;
        console.log(`   ℹ️ Message:`, errData?.message || `HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.log(`   ❌ Error querying ${ep.path}:`, err?.message);
    }
  }

  console.log('\n===============================================================');
  console.log('🏁 VAPI CATALOG EXPLORATION FINISHED');
  console.log('===============================================================\n');
}

exploreVapiCatalog();
