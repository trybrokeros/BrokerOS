/**
 * VAPI Engine Master Catalogs & Benchmarks
 * Derived from VAPI OpenAPI Specification (docs.vapi.ai/api-reference/assistants/create.md)
 */

export interface VapiLlmModelInfo {
  id: string;
  name: string;
  latencyMs: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  contextWindow: string;
  intelligenceTier: 'Ultra+' | 'Ultra' | 'High' | 'Medium' | 'Extreme' | 'NextGen' | 'Dynamic' | 'Custom';
  recommended?: boolean;
}

export interface VapiLlmProviderInfo {
  provider: string;
  name: string;
  badge: string;
  models: VapiLlmModelInfo[];
  features: string[];
}

export interface VapiTranscriberModelInfo {
  id: string;
  name: string;
  latencyMs: number;
  costPerMinute: number;
  accuracyRating: string;
  recommended?: boolean;
}

export interface VapiTranscriberProviderInfo {
  provider: string;
  name: string;
  badge: string;
  models: VapiTranscriberModelInfo[];
  features: string[];
  supportedLanguages?: { code: string; label: string }[];
}

export interface VapiVoiceProviderInfo {
  provider: string;
  name: string;
  latencyMs: number;
  costPerMinute: number;
  naturalnessScore: string;
  models: string[];
  features: string[];
}

export const VAPI_LLM_PROVIDERS: Record<string, VapiLlmProviderInfo> = {
  anthropic: {
    provider: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'State-of-the-Art Dialogue',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', latencyMs: 380, inputCostPer1M: 3.0, outputCostPer1M: 15.0, contextWindow: '200k', intelligenceTier: 'Ultra', recommended: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', latencyMs: 220, inputCostPer1M: 0.8, outputCostPer1M: 4.0, contextWindow: '200k', intelligenceTier: 'High', recommended: true },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet (Hybrid Reasoning)', latencyMs: 420, inputCostPer1M: 3.0, outputCostPer1M: 15.0, contextWindow: '200k', intelligenceTier: 'Ultra+' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', latencyMs: 900, inputCostPer1M: 15.0, outputCostPer1M: 75.0, contextWindow: '200k', intelligenceTier: 'Extreme' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', latencyMs: 500, inputCostPer1M: 3.0, outputCostPer1M: 15.0, contextWindow: '200k', intelligenceTier: 'High' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', latencyMs: 260, inputCostPer1M: 0.25, outputCostPer1M: 1.25, contextWindow: '200k', intelligenceTier: 'Medium' },
      { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (0620)', latencyMs: 450, inputCostPer1M: 3.0, outputCostPer1M: 15.0, contextWindow: '200k', intelligenceTier: 'Ultra' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', latencyMs: 360, inputCostPer1M: 3.0, outputCostPer1M: 15.0, contextWindow: '200k', intelligenceTier: 'NextGen' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', latencyMs: 800, inputCostPer1M: 15.0, outputCostPer1M: 75.0, contextWindow: '200k', intelligenceTier: 'NextGen' },
    ],
    features: ['thinking.budgetTokens', 'temperature', 'maxTokens', 'messages', 'tools', 'knowledgeBase']
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI GPT',
    badge: 'Industry Benchmark',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', latencyMs: 250, inputCostPer1M: 0.15, outputCostPer1M: 0.60, contextWindow: '128k', intelligenceTier: 'High', recommended: true },
      { id: 'gpt-4o', name: 'GPT-4o (Omni)', latencyMs: 450, inputCostPer1M: 2.50, outputCostPer1M: 10.00, contextWindow: '128k', intelligenceTier: 'Ultra', recommended: true },
      { id: 'o3-mini', name: 'o3-mini (Reasoning)', latencyMs: 700, inputCostPer1M: 1.10, outputCostPer1M: 4.40, contextWindow: '128k', intelligenceTier: 'Ultra' },
      { id: 'o1-mini', name: 'o1-mini', latencyMs: 800, inputCostPer1M: 1.10, outputCostPer1M: 4.40, contextWindow: '128k', intelligenceTier: 'High' },
      { id: 'o1-preview', name: 'o1-preview', latencyMs: 1200, inputCostPer1M: 15.0, outputCostPer1M: 60.0, contextWindow: '128k', intelligenceTier: 'Extreme' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', latencyMs: 600, inputCostPer1M: 10.0, outputCostPer1M: 30.0, contextWindow: '128k', intelligenceTier: 'Ultra' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', latencyMs: 300, inputCostPer1M: 0.50, outputCostPer1M: 1.50, contextWindow: '16k', intelligenceTier: 'Medium' },
      { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', latencyMs: 450, inputCostPer1M: 5.0, outputCostPer1M: 15.0, contextWindow: '128k', intelligenceTier: 'Ultra' }
    ],
    features: ['temperature', 'maxTokens', 'messages', 'tools', 'knowledgeBase', 'emotionRecognitionEnabled']
  },
  groq: {
    provider: 'groq',
    name: 'Groq LPU',
    badge: 'Ultra-Low Latency (~100ms)',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', latencyMs: 120, inputCostPer1M: 0.59, outputCostPer1M: 0.79, contextWindow: '128k', intelligenceTier: 'High', recommended: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', latencyMs: 80, inputCostPer1M: 0.05, outputCostPer1M: 0.08, contextWindow: '128k', intelligenceTier: 'Medium', recommended: true },
      { id: 'llama-3.1-405b-reasoning', name: 'Llama 3.1 405B Reasoning', latencyMs: 350, inputCostPer1M: 2.00, outputCostPer1M: 2.00, contextWindow: '128k', intelligenceTier: 'Ultra' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', latencyMs: 200, inputCostPer1M: 0.75, outputCostPer1M: 0.99, contextWindow: '128k', intelligenceTier: 'Ultra' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k)', latencyMs: 140, inputCostPer1M: 0.24, outputCostPer1M: 0.24, contextWindow: '32k', intelligenceTier: 'High' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', latencyMs: 100, inputCostPer1M: 0.20, outputCostPer1M: 0.20, contextWindow: '8k', intelligenceTier: 'Medium' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', latencyMs: 110, inputCostPer1M: 0.30, outputCostPer1M: 0.30, contextWindow: '128k', intelligenceTier: 'NextGen' },
    ],
    features: ['temperature', 'maxTokens', 'messages', 'tools']
  },
  google: {
    provider: 'google',
    name: 'Google Gemini',
    badge: 'Massive Multimodal Context',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', latencyMs: 200, inputCostPer1M: 0.10, outputCostPer1M: 0.40, contextWindow: '1M', intelligenceTier: 'Ultra', recommended: true },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', latencyMs: 140, inputCostPer1M: 0.075, outputCostPer1M: 0.30, contextWindow: '1M', intelligenceTier: 'High' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', latencyMs: 500, inputCostPer1M: 1.25, outputCostPer1M: 5.00, contextWindow: '2M', intelligenceTier: 'Ultra+' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', latencyMs: 220, inputCostPer1M: 0.075, outputCostPer1M: 0.30, contextWindow: '1M', intelligenceTier: 'High' },
      { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp', latencyMs: 600, inputCostPer1M: 2.00, outputCostPer1M: 8.00, contextWindow: '2M', intelligenceTier: 'Extreme' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', latencyMs: 190, inputCostPer1M: 0.10, outputCostPer1M: 0.40, contextWindow: '1M', intelligenceTier: 'NextGen' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', latencyMs: 480, inputCostPer1M: 1.25, outputCostPer1M: 5.00, contextWindow: '2M', intelligenceTier: 'NextGen' },
    ],
    features: ['temperature', 'maxTokens', 'messages', 'tools', 'knowledgeBase']
  },
  deepseek: {
    provider: 'deepseek',
    name: 'DeepSeek AI',
    badge: 'Extreme Value & Logic',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)', latencyMs: 350, inputCostPer1M: 0.14, outputCostPer1M: 0.28, contextWindow: '64k', intelligenceTier: 'Ultra', recommended: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)', latencyMs: 900, inputCostPer1M: 0.55, outputCostPer1M: 2.19, contextWindow: '64k', intelligenceTier: 'Extreme' },
    ],
    features: ['temperature', 'maxTokens', 'messages']
  },
  mistral: {
    provider: 'mistral',
    name: 'Mistral AI',
    badge: 'European Enterprise AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large 2', latencyMs: 380, inputCostPer1M: 2.00, outputCostPer1M: 6.00, contextWindow: '128k', intelligenceTier: 'High' },
      { id: 'mistral-small-latest', name: 'Mistral Small 3', latencyMs: 200, inputCostPer1M: 0.20, outputCostPer1M: 0.60, contextWindow: '128k', intelligenceTier: 'Medium' },
      { id: 'codestral-latest', name: 'Codestral', latencyMs: 280, inputCostPer1M: 0.30, outputCostPer1M: 0.90, contextWindow: '256k', intelligenceTier: 'High' },
      { id: 'ministral-8b-latest', name: 'Ministral 8B', latencyMs: 150, inputCostPer1M: 0.10, outputCostPer1M: 0.10, contextWindow: '128k', intelligenceTier: 'Medium' },
    ],
    features: ['temperature', 'maxTokens', 'messages', 'tools']
  },
  xai: {
    provider: 'xai',
    name: 'xAI Grok',
    badge: 'Real-Time Conversational',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', latencyMs: 380, inputCostPer1M: 5.00, outputCostPer1M: 15.00, contextWindow: '128k', intelligenceTier: 'High' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 (1212)', latencyMs: 400, inputCostPer1M: 2.00, outputCostPer1M: 10.00, contextWindow: '128k', intelligenceTier: 'High' },
    ],
    features: ['temperature', 'maxTokens', 'messages']
  },
  togetherai: {
    provider: 'together-ai',
    name: 'Together AI',
    badge: 'High-Throughput Open Source',
    models: [
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B Turbo', latencyMs: 200, inputCostPer1M: 0.88, outputCostPer1M: 0.88, contextWindow: '128k', intelligenceTier: 'High' },
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B Turbo', latencyMs: 500, inputCostPer1M: 3.50, outputCostPer1M: 3.50, contextWindow: '128k', intelligenceTier: 'Ultra' },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B Turbo', latencyMs: 220, inputCostPer1M: 1.20, outputCostPer1M: 1.20, contextWindow: '128k', intelligenceTier: 'High' },
    ],
    features: ['temperature', 'maxTokens', 'messages']
  },
  perplexityai: {
    provider: 'perplexity-ai',
    name: 'Perplexity AI',
    badge: 'Live Online Search Grounding',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', latencyMs: 450, inputCostPer1M: 3.00, outputCostPer1M: 15.00, contextWindow: '200k', intelligenceTier: 'High' },
      { id: 'sonar', name: 'Sonar', latencyMs: 300, inputCostPer1M: 1.00, outputCostPer1M: 1.00, contextWindow: '128k', intelligenceTier: 'Medium' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning', latencyMs: 800, inputCostPer1M: 1.00, outputCostPer1M: 5.00, contextWindow: '128k', intelligenceTier: 'Ultra' },
    ],
    features: ['temperature', 'maxTokens', 'messages']
  },
  openrouter: {
    provider: 'openrouter',
    name: 'OpenRouter',
    badge: 'Universal Multi-Provider Gateway',
    models: [
      { id: 'openrouter/auto', name: 'OpenRouter Auto Router', latencyMs: 350, inputCostPer1M: 1.0, outputCostPer1M: 2.0, contextWindow: '128k', intelligenceTier: 'Dynamic' }
    ],
    features: ['temperature', 'maxTokens', 'messages']
  },
  customllm: {
    provider: 'custom-llm',
    name: 'Custom LLM',
    badge: 'Private WebSocket / REST Engine',
    models: [
      { id: 'custom-model', name: 'Custom Backend Model', latencyMs: 200, inputCostPer1M: 0, outputCostPer1M: 0, contextWindow: 'Custom', intelligenceTier: 'Custom' }
    ],
    features: ['server.url', 'server.headers', 'server.timeoutSeconds']
  }
};

export const VAPI_TRANSCRIBERS: Record<string, VapiTranscriberProviderInfo> = {
  deepgram: {
    provider: 'deepgram',
    name: 'Deepgram Nova Engine',
    badge: 'Gold Standard STT (98.2% Accuracy)',
    models: [
      { id: 'nova-3', name: 'Deepgram Nova-3 (Ultra Accuracy & Speed)', latencyMs: 150, costPerMinute: 0.0043, accuracyRating: '98.2%', recommended: true },
      { id: 'nova-2', name: 'Deepgram Nova-2', latencyMs: 180, costPerMinute: 0.0043, accuracyRating: '96.5%' },
      { id: 'nova-2-phonecall', name: 'Deepgram Nova-2 Telephony', latencyMs: 180, costPerMinute: 0.0043, accuracyRating: '97.0%' },
      { id: 'nova-2-finance', name: 'Deepgram Nova-2 Finance', latencyMs: 190, costPerMinute: 0.0043, accuracyRating: '96.8%' },
      { id: 'flux-general-en', name: 'Deepgram Flux (Ultra Low Latency)', latencyMs: 120, costPerMinute: 0.0050, accuracyRating: '97.0%' },
      { id: 'whisper', name: 'Deepgram Whisper Cloud', latencyMs: 320, costPerMinute: 0.0048, accuracyRating: '96.0%' }
    ],
    features: ['language', 'smartFormat', 'numerals', 'profanityFilter', 'keywords', 'keyterm', 'endpointing', 'mipOptOut'],
    supportedLanguages: [
      { code: 'en', label: 'English (Global / US)' },
      { code: 'en-IN', label: 'English (India)' },
      { code: 'en-GB', label: 'English (UK)' },
      { code: 'en-AU', label: 'English (Australia)' },
      { code: 'hi', label: 'Hindi (हिंदी)' },
      { code: 'es', label: 'Spanish (Español)' },
      { code: 'fr', label: 'French (Français)' },
      { code: 'de', label: 'German (Deutsch)' },
      { code: 'multi', label: 'Multilingual Auto-Detect' }
    ]
  },
  assemblyai: {
    provider: 'assembly-ai',
    name: 'AssemblyAI Universal',
    badge: 'Keyterm Prompting & Formatted Turns',
    models: [
      { id: 'universal-3-5-pro', name: 'AssemblyAI Universal-3.5-Pro', latencyMs: 190, costPerMinute: 0.0045, accuracyRating: '98.0%', recommended: true },
      { id: 'universal-streaming-english', name: 'AssemblyAI Universal English', latencyMs: 160, costPerMinute: 0.0040, accuracyRating: '96.8%' },
      { id: 'universal-streaming-multilingual', name: 'AssemblyAI Multilingual', latencyMs: 220, costPerMinute: 0.0045, accuracyRating: '96.5%' }
    ],
    features: ['language', 'mode', 'wordBoost', 'keytermsPrompt', 'formatTurns', 'vadAssistedEndpointingEnabled', 'confidenceThreshold']
  },
  gladia: {
    provider: 'gladia',
    name: 'Gladia Audio Engine',
    badge: 'Audio Enhancer & Prosody',
    models: [
      { id: 'fast', name: 'Gladia Fast Realtime', latencyMs: 180, costPerMinute: 0.0055, accuracyRating: '97.5%' },
      { id: 'accurate', name: 'Gladia Accurate', latencyMs: 280, costPerMinute: 0.0070, accuracyRating: '98.5%' }
    ],
    features: ['language', 'languageBehaviour', 'audioEnhancer', 'prosody', 'customVocabularyConfig', 'endpointing']
  },
  speechmatics: {
    provider: 'speechmatics',
    name: 'Speechmatics Voice Intelligence',
    badge: 'World Accent Master (98.5% Accuracy)',
    models: [
      { id: 'enhanced', name: 'Speechmatics Enhanced', latencyMs: 200, costPerMinute: 0.0060, accuracyRating: '98.5%' },
      { id: 'standard', name: 'Speechmatics Standard', latencyMs: 150, costPerMinute: 0.0045, accuracyRating: '97.0%' }
    ],
    features: ['language', 'operatingPoint', 'enableDiarization', 'numeralStyle', 'removeDisfluencies', 'customVocabulary']
  },
  azure: {
    provider: 'azure',
    name: 'Azure Speech Services',
    badge: '140+ Regional Locales',
    models: [
      { id: 'azure', name: 'Azure Multi-Locale STT', latencyMs: 220, costPerMinute: 0.0050, accuracyRating: '96.0%' }
    ],
    features: ['language', 'segmentationStrategy', 'segmentationSilenceTimeoutMs', 'segmentationMaximumTimeMs']
  },
  google: {
    provider: 'google',
    name: 'Google Gemini Speech',
    badge: 'Multilingual Auto-Switching',
    models: [
      { id: 'google', name: 'Google Cloud Speech STT', latencyMs: 240, costPerMinute: 0.0040, accuracyRating: '96.2%' }
    ],
    features: ['language']
  },
  cartesia: {
    provider: 'cartesia',
    name: 'Cartesia Ink STT',
    badge: 'Ultra Low-Latency Streaming STT',
    models: [
      { id: 'ink-whisper', name: 'Cartesia Ink Whisper', latencyMs: 140, costPerMinute: 0.0048, accuracyRating: '97.1%' },
      { id: 'ink-2', name: 'Cartesia Ink-2', latencyMs: 120, costPerMinute: 0.0052, accuracyRating: '97.5%' }
    ],
    features: ['language']
  },
  soniox: {
    provider: 'soniox',
    name: 'Soniox Precision STT',
    badge: 'Customizable Latency Levels (0-3)',
    models: [
      { id: 'stt-rt-v5', name: 'Soniox STT RT v5', latencyMs: 130, costPerMinute: 0.0052, accuracyRating: '97.8%' },
      { id: 'stt-rt-v4', name: 'Soniox STT RT v4', latencyMs: 160, costPerMinute: 0.0045, accuracyRating: '96.8%' }
    ],
    features: ['language', 'languages', 'languageHintsStrict', 'maxEndpointDelayMs', 'endpointSensitivity', 'endpointLatencyAdjustmentLevel']
  },
  talkscriber: {
    provider: 'talkscriber',
    name: 'Talkscriber Whisper',
    badge: 'Standard Open Source STT',
    models: [
      { id: 'whisper', name: 'Whisper Universal', latencyMs: 300, costPerMinute: 0.0030, accuracyRating: '95.5%' }
    ],
    features: ['language']
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI Speech Transcription',
    badge: 'Native Realtime Transcribe',
    models: [
      { id: 'gpt-4o-transcribe', name: 'GPT-4o Realtime Transcribe', latencyMs: 220, costPerMinute: 0.0060, accuracyRating: '98.0%' },
      { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', latencyMs: 180, costPerMinute: 0.0035, accuracyRating: '97.0%' }
    ],
    features: ['language']
  },
  elevenlabs: {
    provider: '11labs',
    name: 'ElevenLabs Scribe STT',
    badge: 'Expressive Audio Scribe',
    models: [
      { id: 'scribe-v1', name: 'ElevenLabs Scribe Realtime', latencyMs: 180, costPerMinute: 0.0060, accuracyRating: '97.5%' }
    ],
    features: ['language', 'silenceThresholdSeconds', 'confidenceThreshold', 'minSpeechDurationMs']
  }
};

export const VAPI_VOICE_PROVIDERS: Record<string, VapiVoiceProviderInfo> = {
  vapi: {
    provider: 'vapi',
    name: 'Vapi Built-In Voice',
    latencyMs: 110,
    costPerMinute: 0.015,
    naturalnessScore: '96.0% (Zero Hop Streaming)',
    models: ['v2', 'latest', '1'],
    features: ['voiceId', 'speed', 'language', 'pronunciationDictionary']
  },
  elevenlabs: {
    provider: '11labs',
    name: 'ElevenLabs Voice AI',
    latencyMs: 200,
    costPerMinute: 0.050,
    naturalnessScore: '99.5% (Hyper-Realistic)',
    models: ['eleven_turbo_v2_5', 'eleven_flash_v2_5', 'eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_v3', 'eleven_monolingual_v1'],
    features: ['voiceId', 'speed', 'stability', 'similarityBoost', 'style', 'useSpeakerBoost', 'optimizeStreamingLatency', 'enableSsmlParsing']
  },
  cartesia: {
    provider: 'cartesia',
    name: 'Cartesia Sonic AI',
    latencyMs: 95,
    costPerMinute: 0.035,
    naturalnessScore: '98.5% (Sub-100ms Ultra-Fast)',
    models: ['sonic-3.5', 'sonic-3', 'sonic-2', 'sonic-english', 'sonic-multilingual'],
    features: ['voiceId', 'speed', 'language', 'experimentalControls', 'generationConfig']
  },
  deepgram: {
    provider: 'deepgram',
    name: 'Deepgram Aura',
    latencyMs: 110,
    costPerMinute: 0.015,
    naturalnessScore: '95.0% (Clean Telephony)',
    models: ['aura-2', 'aura'],
    features: ['voiceId', 'model', 'mipOptOut']
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI Voice Engine',
    latencyMs: 180,
    costPerMinute: 0.020,
    naturalnessScore: '96.0% (Expressive)',
    models: ['gpt-4o-mini-tts', 'tts-1-hd', 'tts-1'],
    features: ['voiceId', 'speed', 'instructions']
  },
  azure: {
    provider: 'azure',
    name: 'Azure Neural HD',
    latencyMs: 180,
    costPerMinute: 0.018,
    naturalnessScore: '95.0% (140+ Locales)',
    models: ['azure-neural-hd'],
    features: ['voiceId', 'speed', 'style', 'styleDegree', 'role']
  },
  xai: {
    provider: 'xai',
    name: 'xAI Grok Voice',
    latencyMs: 110,
    costPerMinute: 0.020,
    naturalnessScore: '97.0% (Fast & Expressive)',
    models: ['xai-tts-1'],
    features: ['voiceId', 'speed', 'language']
  },
  inworld: {
    provider: 'inworld',
    name: 'Inworld AI Voice',
    latencyMs: 130,
    costPerMinute: 0.025,
    naturalnessScore: '96.5% (Character & Persona)',
    models: ['inworld-tts-1'],
    features: ['voiceId', 'languageCode', 'temperature', 'speakingRate']
  },
  minimax: {
    provider: 'minimax',
    name: 'MiniMax Audio',
    latencyMs: 140,
    costPerMinute: 0.020,
    naturalnessScore: '97.5% (HD Expressive)',
    models: ['speech-02-turbo', 'speech-02-hd', 'speech-2.5-turbo-preview'],
    features: ['voiceId', 'model', 'emotion', 'pitch', 'speed', 'volume', 'languageBoost']
  },
  lmnt: {
    provider: 'lmnt',
    name: 'LMNT Voice',
    latencyMs: 130,
    costPerMinute: 0.025,
    naturalnessScore: '94.5% (Smooth Flow)',
    models: ['lmnt-v1'],
    features: ['voiceId', 'speed', 'language']
  },
  neuphonic: {
    provider: 'neuphonic',
    name: 'Neuphonic HQ',
    latencyMs: 110,
    costPerMinute: 0.020,
    naturalnessScore: '95.0% (HQ Low Latency)',
    models: ['neu_hq', 'neu_fast'],
    features: ['voiceId', 'speed', 'language']
  },
  hume: {
    provider: 'hume',
    name: 'Hume Octave',
    latencyMs: 190,
    costPerMinute: 0.040,
    naturalnessScore: '98.0% (Empathic Synthesis)',
    models: ['octave2', 'octave'],
    features: ['voiceId', 'description']
  },
  rimeai: {
    provider: 'rime-ai',
    name: 'Rime AI',
    latencyMs: 120,
    costPerMinute: 0.025,
    naturalnessScore: '95.5% (Snappy Flow)',
    models: ['arcana', 'mistv3', 'mistv2', 'coda', 'mist'],
    features: ['voiceId', 'speed', 'language', 'reduceLatency']
  },
  microsoft: {
    provider: 'microsoft',
    name: 'Microsoft MAI-Voice-2',
    latencyMs: 160,
    costPerMinute: 0.020,
    naturalnessScore: '96.0% (MAI-Voice-2 Neural)',
    models: ['MAI-Voice-2'],
    features: ['voiceId', 'speed', 'style', 'styleDegree', 'role']
  },
  customvoice: {
    provider: 'custom-voice',
    name: 'Custom Voice Endpoint',
    latencyMs: 150,
    costPerMinute: 0.020,
    naturalnessScore: 'Custom',
    models: ['custom-voice'],
    features: ['server.url', 'server.headers', 'server.timeoutSeconds']
  }
};

/**
 * Real-Time Call Metrics Calculation
 * Assumes average phone turn of 25 input tokens / 20 output tokens per minute (approx 6 conversational turns/min)
 */
export function calculateVapiCallMetrics(
  transcriberProvider = 'deepgram',
  transcriberModel = 'nova-3',
  llmProvider = 'openai',
  llmModel = 'gpt-4o-mini',
  voiceProvider = '11labs'
) {
  // 1. STT
  const sttProv = VAPI_TRANSCRIBERS[transcriberProvider] || VAPI_TRANSCRIBERS.deepgram;
  const sttModel = sttProv.models.find((m) => m.id === transcriberModel) || sttProv.models[0];
  const sttCost = sttModel.costPerMinute;
  const sttLatency = sttModel.latencyMs;

  // 2. LLM (Estimated 300 input tokens + 200 output tokens per min of telephony conversation)
  const llmProv = VAPI_LLM_PROVIDERS[llmProvider] || VAPI_LLM_PROVIDERS.openai;
  const llmMod = llmProv.models.find((m) => m.id === llmModel) || llmProv.models[0];
  const inputTokensPerMin = 300;
  const outputTokensPerMin = 200;
  const llmCost = (inputTokensPerMin / 1_000_000) * llmMod.inputCostPer1M + (outputTokensPerMin / 1_000_000) * llmMod.outputCostPer1M;
  const llmLatency = llmMod.latencyMs;

  // 3. TTS
  const ttsProv = VAPI_VOICE_PROVIDERS[voiceProvider] || VAPI_VOICE_PROVIDERS.elevenlabs;
  const ttsCost = ttsProv.costPerMinute;
  const ttsLatency = ttsProv.latencyMs;

  // 4. Base Vapi Platform Orchestration Fee (~$0.05/min)
  const vapiPlatformCost = 0.05;

  const totalCostPerMin = Number((sttCost + llmCost + ttsCost + vapiPlatformCost).toFixed(4));
  const estimatedLatencyMs = sttLatency + llmLatency + ttsLatency;

  return {
    totalCostPerMin,
    estimatedLatencyMs,
    breakdown: {
      stt: { name: sttModel.name, cost: sttCost, latencyMs: sttLatency },
      llm: { name: llmMod.name, cost: llmCost, latencyMs: llmLatency },
      tts: { name: ttsProv.name, cost: ttsCost, latencyMs: ttsLatency },
      platform: { name: 'Vapi Pipeline Orchestration', cost: vapiPlatformCost }
    }
  };
}
