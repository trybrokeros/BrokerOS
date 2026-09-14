import dotenv from 'dotenv';
dotenv.config();

async function testEleven() {
  const key = process.env.ELEVENLABS_API_KEY || 'sk_f6fd7e84e7df7753e363e2f61977332ebd98762437c7ecf0';
  console.log('Testing ElevenLabs key:', key.slice(0, 10));

  const res1 = await fetch('https://api.elevenlabs.io/v1/user', {
    headers: { 'xi-api-key': key }
  });
  console.log('GET /v1/user status:', res1.status);
  const data1 = await res1.json().catch(() => ({}));
  console.log('Data:', data1);

  const res2 = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': key }
  });
  console.log('GET /v1/voices status:', res2.status);
  const data2 = await res2.json().catch(() => ({}));
  console.log('Voices count:', data2?.voices?.length);
}

testEleven().catch(console.error);
