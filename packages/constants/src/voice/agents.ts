// ============================================================================
// BrokerOS — Voice Agent Platforms & LLM Orchestrator Catalog
// ============================================================================

export const VOICE_AGENT_PLATFORMS = [
  {
    platform: 'VAPI',
    name: 'Vapi AI (Enterprise Voice Engine)',
    badge: 'Flagship Orchestrator',
    description: 'Ultra-low latency speech pipeline combining Groq/OpenAI LLMs with ElevenLabs & Cartesia voices with dynamic interruption handling.',
    fields: [
      { key: 'apiKey', label: 'Vapi Private API Key', type: 'password', placeholder: 'vapi_live_xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'orgId', label: 'Organization ID (Optional)', type: 'text', placeholder: 'org_xxxxxxxxxxxx', required: false },
    ],
    supportedFeatures: ['End-of-Call Webhooks', 'Dynamic Variables', 'Live Interruption', 'Function Calling', 'Custom Transcriber'],
  },
  {
    platform: 'RETELL',
    name: 'Retell AI (Sales Dialogue Agent)',
    badge: 'High Conversational Nuance',
    description: 'Specialized conversational AI with state machines, warm transfer, custom backchanneling, and calibrated emotional speech synthesis.',
    fields: [
      { key: 'apiKey', label: 'Retell API Key', type: 'password', placeholder: 'key_xxxxxxxxxxxxxxxxxxxx', required: true },
    ],
    supportedFeatures: ['Warm Transfer', 'In-call Variables', 'Real-time Sentiment', 'Voicemail Detection', 'Backchanneling'],
  },
  {
    platform: 'SARVAM',
    name: 'Sarvam AI (Indic Speech & Dialects)',
    badge: 'Indian Languages Leader',
    description: 'Built specifically for India: High-accuracy speech synthesis in Hindi, Hinglish, Tamil, Telugu, Marathi, and Gujarati.',
    fields: [
      { key: 'apiKey', label: 'Sarvam API Subscription Key', type: 'password', placeholder: 'sarvam_sub_xxxxxxxxxxxx', required: true },
    ],
    supportedFeatures: ['11 Indian Languages', 'Hinglish Native Cadence', 'Bulbul v3 TTS', 'Saaras v3 STT'],
  },
  {
    platform: 'BOLNA',
    name: 'Bolna AI (Real Estate Callflows)',
    badge: 'Bilingual Sales Flows',
    description: 'Optimized voice assistant framework for Indian real estate cold outreach with seamless telephony bridge connectors.',
    fields: [
      { key: 'apiKey', label: 'Bolna API Key', type: 'password', placeholder: 'bolna_api_xxxxxxxxxxxx', required: true },
    ],
    supportedFeatures: ['Custom Call Graph', 'Deepgram + Cartesia', 'Multi-carrier Bridge'],
  },
  {
    platform: 'ELEVENLABS',
    name: 'ElevenLabs Conversational AI',
    badge: 'Ultra-Realistic Speech',
    description: 'Industry-leading neural audio quality with expressive inflection, cloneable broker personas, and multi-language adaptability.',
    fields: [
      { key: 'apiKey', label: 'ElevenLabs xi-api-key', type: 'password', placeholder: 'xi-xxxxxxxxxxxxxxxxxxxx', required: true },
    ],
    supportedFeatures: ['Voice Cloning', 'Turbo v2.5 Latency', 'Multi-dialect Support'],
  },
  {
    platform: 'OPENAI_REALTIME',
    name: 'OpenAI Realtime API (Speech-to-Speech)',
    badge: 'Multimodal GPT-4o',
    description: 'Direct audio-in audio-out multimodal model avoiding cascade latency with natural tone shifts and instant interruptions.',
    fields: [
      { key: 'apiKey', label: 'OpenAI API Key (sk-...)', type: 'password', placeholder: 'sk-proj-xxxxxxxxxxxxxxxxxxxx', required: true },
    ],
    supportedFeatures: ['End-to-end Speech Multimodal', 'Zero Cascade Latency', 'Structured Tool Calling'],
  },
  {
    platform: 'LIVEKIT',
    name: 'LiveKit Voice Agents (WebRTC SIP Engine)',
    badge: 'Open Source Cloud / WebRTC',
    description: 'Enterprise WebRTC SIP pipeline running ultra-low latency voice agents on LiveKit Cloud or self-hosted SIP edge servers.',
    fields: [
      { key: 'apiKey', label: 'LiveKit API Key', type: 'text', placeholder: 'APIxxxxxxxxxxxx', required: true },
      { key: 'apiSecret', label: 'LiveKit API Secret', type: 'password', placeholder: 'secret_xxxxxxxxxxxxxxxx', required: true },
      { key: 'serverUrl', label: 'LiveKit Server URL (wss://...)', type: 'text', placeholder: 'wss://your-project.livekit.cloud', required: true },
    ],
    supportedFeatures: ['WebRTC SIP Telephony', 'Direct Audio Streams', 'Sub-200ms Latency'],
  },
  {
    platform: 'PIPECAT',
    name: 'Pipecat AI (Modular Pipeline Framework)',
    badge: 'Custom Edge Runner',
    description: 'Open source real-time framework with custom VAD, Cartesia TTS, Deepgram STT, and custom local LLM connectors.',
    fields: [
      { key: 'serverUrl', label: 'Pipecat Runner URL', type: 'text', placeholder: 'https://voice.yourbrokerage.com:8765', required: true },
    ],
    supportedFeatures: ['Custom VAD Tuning', 'Self-hosted Pipeline', 'Multi-modal Audio'],
  },
] as const;

export const VOICE_LLM_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Ultra Fast ~100ms)', provider: 'OpenAI', badge: 'Recommended' },
  { id: 'gpt-4o', name: 'GPT-4o (High Intelligence & Negotiation)', provider: 'OpenAI', badge: 'Smartest' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Nuanced Empathy)', provider: 'Anthropic', badge: 'Nuanced' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast Turns)', provider: 'Anthropic', badge: 'Low Latency' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq LPU Sub-50ms)', provider: 'Groq', badge: 'Fastest' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Google Multimodal)', provider: 'Google', badge: 'High Context' },
  { id: 'sarvam-2b', name: 'Sarvam 2B (Indic Native LLM)', provider: 'Sarvam AI', badge: 'Indic Native' },
] as const;

export const VAPI_SETTINGS_CATALOG = {
  transcribers: [
    { id: 'deepgram-nova-3', name: 'Deepgram Nova-3 (State of the Art)', model: 'nova-3', provider: 'deepgram' },
    { id: 'deepgram-nova-2', name: 'Deepgram Nova-2 (General Speech)', model: 'nova-2', provider: 'deepgram' },
    { id: 'talkscriber-whisper', name: 'Talkscriber Whisper (Accurate Accents)', model: 'whisper', provider: 'talkscriber' },
  ],
  languages: [
    { code: 'en', label: 'English (US / Global)' },
    { code: 'en-IN', label: 'English (Indian Accent)' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'mr', label: 'Marathi' },
    { code: 'es', label: 'Spanish' },
    { code: 'ar', label: 'Arabic' },
  ],
  firstMessageModes: [
    { id: 'assistant-speaks-first', label: 'Assistant Speaks First', description: 'Agent greets lead immediately when call is answered' },
    { id: 'assistant-waits-for-user', label: 'Wait for Lead to Speak First', description: 'Agent listens and responds after lead says "Hello"' },
  ],
  backgroundSounds: [
    { id: 'off', label: 'Clean Studio (No Background)' },
    { id: 'office', label: 'Subtle Sales Office Ambient' },
  ],
} as const;

export const RETELL_SETTINGS_CATALOG = {
  ambientSounds: [
    { id: 'none', label: 'Clean Quiet Studio' },
    { id: 'coffee-shop', label: 'Subtle Commercial Gallery Ambient' },
    { id: 'office-ambience', label: 'Busy Sales Floor Ambient' },
  ],
  voiceEmotions: [
    { id: 'curious', label: 'Curious & Inquisitive (Discovery Calls)' },
    { id: 'friendly', label: 'Warm & Friendly (Relationship Building)' },
    { id: 'confident', label: 'Authoritative & Confident (Closing Offers)' },
    { id: 'empathetic', label: 'Empathetic & Calm (Objection Handling)' },
  ],
} as const;
