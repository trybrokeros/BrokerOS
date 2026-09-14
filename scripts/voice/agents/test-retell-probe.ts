import { prismaClient as prisma } from '@brokeros/prisma';

// Retell AI API Key (can be passed via process.env or script)
const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

interface EndpointTest {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  body?: any;
}

async function runRetellProbe() {
  console.log('====================================================');
  console.log('🔍 PROBING RETELL AI LIVE REST API ENDPOINTS');
  console.log('====================================================\n');

  if (!RETELL_API_KEY) {
    console.log('⚠️ No RETELL_API_KEY found.');
    console.log('👉 Please set RETELL_API_KEY in your .env or pass it when running:');
    console.log('   RETELL_API_KEY="key_..." pnpm run script scripts/test-retell-probe.ts\n');
  }

  const headers = {
    Authorization: `Bearer ${RETELL_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const endpoints: EndpointTest[] = [
    { name: '1. List Agents (GET /list-agents)', url: 'https://api.retellai.com/list-agents', method: 'GET' },
    { name: '2. List Agents v2 (GET /v2/list-agents)', url: 'https://api.retellai.com/v2/list-agents', method: 'GET' },
    { name: '3. List Voices (GET /list-voices)', url: 'https://api.retellai.com/list-voices', method: 'GET' },
    { name: '4. List Retell LLMs (GET /v2/list-retell-llms)', url: 'https://api.retellai.com/v2/list-retell-llms', method: 'GET' },
    { name: '5. List Phone Numbers (GET /list-phone-numbers)', url: 'https://api.retellai.com/list-phone-numbers', method: 'GET' },
    { name: '6. List Phone Numbers v2 (GET /v2/list-phone-numbers)', url: 'https://api.retellai.com/v2/list-phone-numbers', method: 'GET' },
  ];

  for (const ep of endpoints) {
    console.log(`📡 Testing ${ep.name}...`);
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }

      console.log(`   Status: HTTP ${res.status} ${res.statusText}`);

      if (res.ok) {
        if (Array.isArray(json)) {
          console.log(`   ✅ Success! Array returned with ${json.length} items.`);
          if (json.length > 0) {
            console.log(`   Sample Item:`, JSON.stringify(json[0], null, 2).slice(0, 400) + '...\n');
          } else {
            console.log(`   (Array is empty: 0 items configured yet)\n`);
          }
        } else {
          console.log(`   ✅ Success! Response:`, JSON.stringify(json, null, 2).slice(0, 400) + '...\n');
        }
      } else {
        console.log(`   ❌ Error Response:`, JSON.stringify(json, null, 2).slice(0, 300) + '\n');
      }
    } catch (err: any) {
      console.log(`   ⚠️ Request Failed: ${err?.message}\n`);
    }
  }

  console.log('====================================================');
  console.log('🏁 RETELL PROBE COMPLETED');
  console.log('====================================================');
}

runRetellProbe()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
