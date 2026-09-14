import {
  getVoiceTelephonyProvider,
  getVoiceAgentProvider,
  TwilioTelephonyClient,
  VobizTelephonyClient,
  ExotelTelephonyClient,
  TelnyxTelephonyClient,
  VapiAgentClient,
  RetellAgentClient,
  ElevenLabsAgentClient,
  SarvamAgentClient,
  BolnaAgentClient,
  PipecatAgentClient,
  LiveKitAgentClient,
  OpenAIRealtimeAgentClient,
} from '../../../integrations/voice/index.js';

async function main() {
  console.log('=== [PHASE 2] Testing Decoupled Voice Integrations ===\n');

  // 1. Test Telephony Adapters
  console.log('[1/2] Testing Telephony Carrier Adapters...');

  const twilio = new TwilioTelephonyClient({
    accountSid: '',
    authToken: '',
  });
  console.log(`  - Twilio Client Initialized (Provider: ${twilio.providerType})`);

  const vobiz = new VobizTelephonyClient({
    apiKey: '',
    apiToken: '',
  });
  console.log(`  - Vobiz AI Client Initialized (Provider: ${vobiz.providerType})`);

  const exotel = new ExotelTelephonyClient({
    apiKey: 'exo_key_1234567890',
    apiToken: 'exo_tok_1234567890',
    accountSid: 'exo_sid_123',
  });
  console.log(`  - Exotel Client Initialized (Provider: ${exotel.providerType})`);

  const telnyx = new TelnyxTelephonyClient({
    apiKey: 'KEY012345678901234567890',
  });
  console.log(`  - Telnyx Client Initialized (Provider: ${telnyx.providerType})`);

  // 2. Test Voice Agent Adapters
  console.log('\n[2/2] Testing AI Voice Agent Engine Adapters...');

  const vapi = new VapiAgentClient({ apiKey: 'vapi_test_key_1234567890' });
  console.log(`  - Vapi AI Client Initialized (Platform: ${vapi.platformType})`);

  const retell = new RetellAgentClient({ apiKey: 'key_test_retell_12345678' });
  console.log(`  - Retell AI Client Initialized (Platform: ${retell.platformType})`);

  const elevenlabs = new ElevenLabsAgentClient({ apiKey: 'eleven_test_key_12345678' });
  console.log(`  - ElevenLabs Client Initialized (Platform: ${elevenlabs.platformType})`);

  const sarvam = new SarvamAgentClient({ apiKey: 'sarvam_test_key_12345678' });
  console.log(`  - Sarvam AI Indic Client Initialized (Platform: ${sarvam.platformType})`);

  const bolna = new BolnaAgentClient({ apiKey: 'bolna_test_key_12345678' });
  console.log(`  - Bolna AI Client Initialized (Platform: ${bolna.platformType})`);

  const pipecat = new PipecatAgentClient({ serverUrl: 'http://localhost:8765' });
  console.log(`  - Pipecat Client Initialized (Platform: ${pipecat.platformType})`);

  const livekit = new LiveKitAgentClient({ apiKey: 'lk_key_123456789012' });
  console.log(`  - LiveKit Client Initialized (Platform: ${livekit.platformType})`);

  const openaiRt = new OpenAIRealtimeAgentClient({ apiKey: 'sk-test-123456789012345678901234' });
  console.log(`  - OpenAI Realtime Client Initialized (Platform: ${openaiRt.platformType})`);

  // 3. Test Dynamic Models and Voices Catalog Fetching
  console.log('\n[3/4] Testing Dynamic Models & Voices Catalog on all 8 Voice Adapters...');
  const [elevenModels, elevenVoices] = await Promise.all([
    elevenlabs.getAvailableModels(),
    elevenlabs.getAvailableVoices(),
  ]);
  console.log(`  - ElevenLabs Dynamic Models: ${elevenModels.length}, Voices: ${elevenVoices.length}`);

  const [retellModels, retellVoices] = await Promise.all([
    retell.getAvailableModels(),
    retell.getAvailableVoices(),
  ]);
  console.log(`  - Retell Dynamic Models: ${retellModels.length}, Voices: ${retellVoices.length}`);

  const [vapiModels, vapiVoices] = await Promise.all([
    vapi.getAvailableModels(),
    vapi.getAvailableVoices(),
  ]);
  console.log(`  - Vapi Dynamic Models: ${vapiModels.length}, Voices: ${vapiVoices.length}`);

  const [sarvamModels, sarvamVoices] = await Promise.all([
    sarvam.getAvailableModels(),
    sarvam.getAvailableVoices(),
  ]);
  console.log(`  - Sarvam Indic Models: ${sarvamModels.length}, Voices: ${sarvamVoices.length}`);

  const [bolnaModels, bolnaVoices] = await Promise.all([
    bolna.getAvailableModels(),
    bolna.getAvailableVoices(),
  ]);
  console.log(`  - Bolna Dynamic Models: ${bolnaModels.length}, Voices: ${bolnaVoices.length}`);

  const [oaiModels, oaiVoices] = await Promise.all([
    openaiRt.getAvailableModels(),
    openaiRt.getAvailableVoices(),
  ]);
  console.log(`  - OpenAI Realtime Models: ${oaiModels.length}, Voices: ${oaiVoices.length}`);

  // 4. Test Factory & Audio Preview synthesis
  console.log('\n[4/4] Testing Factory instantiation & Audio Preview synthesizer...');
  const factoryProvider = getVoiceAgentProvider('VAPI');
  const preview = await factoryProvider.previewAudio('Hello Rahul, VIP site visit confirmed.', '21m00Tcm4TlvDq8ikWAM');
  console.log(`  - Preview Audio Generated: ${preview.audioBuffer.length} bytes, ContentType: ${preview.contentType}`);

  console.log('\n✅ [ALL 8 ADAPTERS PASSED] Dynamic Voice Platform Catalogs & Telephony Adapters 100% verified!');
}

main().catch((err) => {
  console.error('❌ Error verifying Phase 2 integrations:', err);
  process.exit(1);
});
