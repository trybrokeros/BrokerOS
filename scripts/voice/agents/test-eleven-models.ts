import dotenv from 'dotenv';
dotenv.config();

async function testElevenModels() {
  const key = process.env.ELEVENLABS_API_KEY || 'sk_f6fd7e84e7df7753e363e2f61977332ebd98762437c7ecf0';
  const res = await fetch('https://api.elevenlabs.io/v1/models', {
    headers: { 'xi-api-key': key }
  });
  console.log('GET /v1/models status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('Models data:', Array.isArray(data) ? `Found ${data.length} models` : data);
}

testElevenModels().catch(console.error);
