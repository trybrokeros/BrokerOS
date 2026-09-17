// ============================================================================
// BrokerOS — Vapi AI Model Catalogs & Remote Assistant Manager
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';
import { VAPI_LLM_PROVIDERS } from '@brokeros/constants';

export const STANDARD_VAPI_MODELS: VoiceModelItem[] = Object.values(VAPI_LLM_PROVIDERS).flatMap((prov) =>
  prov.models.map((m) => ({
    id: m.id,
    name: m.name,
    provider: prov.name,
    badge: m.recommended ? 'Recommended' : m.intelligenceTier,
    description: `Latency ~${m.latencyMs}ms | In: $${m.inputCostPer1M}/1M | Out: $${m.outputCostPer1M}/1M | Ctx: ${m.contextWindow}`,
  }))
);

export async function fetchVapiAccountModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return STANDARD_VAPI_MODELS;
  try {
    const res = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const assistants = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(assistants) && assistants.length > 0) {
        return assistants.map((asst: any) => ({
          id: asst.id,
          name: `${asst.name || 'Assistant'} (${asst.model?.model || asst.model?.provider || 'Vapi'})`,
          provider: (asst.model?.provider || 'Vapi').toUpperCase(),
          badge: 'My Vapi Assistant',
          description: `Configured Assistant on your Vapi Account: ${asst.name || asst.id}`,
        }));
      }
    }
  } catch {
    // fallback gracefully
  }
  return STANDARD_VAPI_MODELS;
}

export async function fetchVapiAccountAssistants(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const assistants = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(assistants)) {
        return assistants.map((asst: any) => ({
          id: asst.id,
          name: asst.name || 'Untitled Assistant',
          firstMessage: asst.firstMessage || '',
          firstMessageMode: asst.firstMessageMode || 'assistant-speaks-first',
          firstMessageInterruptionsEnabled: asst.firstMessageInterruptionsEnabled ?? false,
          voicemailDetection: typeof asst.voicemailDetection === 'string' ? asst.voicemailDetection : asst.voicemailDetection?.provider || 'off',
          voicemailMessage: asst.voicemailMessage || '',
          backgroundSound: asst.backgroundSound || 'off',
          backchannelingEnabled: asst.backchannelingEnabled ?? true,
          backgroundDenoisingEnabled: asst.backgroundDenoisingEnabled ?? true,
          silenceTimeoutSeconds: asst.silenceTimeoutSeconds || 30,
          maxDurationSeconds: asst.maxDurationSeconds || 600,
          endCallMessage: asst.endCallMessage || '',
          endCallPhrases: asst.endCallPhrases || [],
          model: {
            provider: asst.model?.provider || 'openai',
            model: asst.model?.model || 'gpt-4o-mini',
            temperature: asst.model?.temperature ?? 0.7,
            maxTokens: asst.model?.maxTokens ?? 500,
            systemPrompt: asst.model?.messages?.find((m: any) => m.role === 'system')?.content || '',
            emotionRecognitionEnabled: asst.model?.emotionRecognitionEnabled ?? false,
            thinking: asst.model?.thinking,
          },
          voice: {
            provider: asst.voice?.provider || '11labs',
            voiceId: asst.voice?.voiceId || '21m00Tcm4TlvDq8ikWAM',
            speed: asst.voice?.speed ?? 1.0,
            stability: asst.voice?.stability ?? 0.5,
            similarityBoost: asst.voice?.similarityBoost ?? 0.75,
            style: asst.voice?.style ?? 0.0,
            useSpeakerBoost: asst.voice?.useSpeakerBoost ?? true,
          },
          transcriber: {
            provider: asst.transcriber?.provider || 'deepgram',
            model: asst.transcriber?.model || asst.transcriber?.speechModel || 'nova-3',
            language: asst.transcriber?.language || 'en',
            smartFormat: asst.transcriber?.smartFormat ?? true,
            numerals: asst.transcriber?.numerals ?? true,
            endpointing: asst.transcriber?.endpointing ?? 10,
            keywords: asst.transcriber?.keywords || [],
          },
        }));
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export const VAPI_BUILTIN_VOICES = [
  'asteria', 'luna', 'stella', 'athena', 'hera', 'orion', 'arcas', 'perseus',
  'angus', 'orpheus', 'helios', 'zeus', 'thalia', 'andromeda', 'helena', 'apollo',
  'aries', 'amalthea', 'atlas', 'aurora', 'callista', 'cora', 'cordelia', 'delia',
  'draco', 'electra', 'harmonia', 'hermes', 'hyperion', 'iris', 'janus', 'juno',
  'jupiter', 'mars', 'minerva', 'neptune', 'odysseus', 'ophelia', 'pandora', 'phoebe',
  'pluto', 'saturn', 'selene', 'theia', 'vesta', 'celeste', 'estrella', 'nestor',
  'sirio', 'carina', 'alvaro', 'diana', 'aquila', 'selena', 'javier', 'viktoria',
  'kara', 'fabian', 'julius', 'lara', 'elara', 'aurelia'
] as const;

const VAPI_BUILTIN_SET = new Set<string>(VAPI_BUILTIN_VOICES.map((v) => v.toLowerCase()));

const OPENAI_VOICES_SET = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash', 'ballad', 'coral', 'sage', 'verse']);

export function buildVapiVoicePayload(config: any): any {
  let provider = (config.voiceProvider || config.voice?.provider || '11labs').toLowerCase().trim();
  let rawVoiceId = (config.voiceId || config.voice?.voiceId || '21m00Tcm4TlvDq8ikWAM').trim();

  // Strip 11labs- prefix if present
  let cleanVoiceId = rawVoiceId.replace(/^11labs[-_]/i, '');
  const lowerVoiceId = cleanVoiceId.toLowerCase();

  // Auto-detect provider routing if mismatch exists
  if (VAPI_BUILTIN_SET.has(lowerVoiceId)) {
    if (provider !== 'deepgram') {
      provider = 'vapi';
    }
    cleanVoiceId = lowerVoiceId;
  } else if (OPENAI_VOICES_SET.has(lowerVoiceId)) {
    provider = 'openai';
    cleanVoiceId = lowerVoiceId;
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanVoiceId)) {
    provider = 'cartesia';
  } else if (provider === 'vapi') {
    // voiceId is not a native Vapi voice - check if it's an ElevenLabs ID
    if (cleanVoiceId.length >= 15 || rawVoiceId.startsWith('11labs-')) {
      provider = '11labs';
    } else {
      cleanVoiceId = 'asteria';
    }
  }

  switch (provider) {
    case 'deepgram': {
      const dgClean = cleanVoiceId.toLowerCase().replace(/^(deepgram|aura)[-_]/i, '').replace(/[-_]en$/, '').trim();
      return {
        provider: 'deepgram',
        voiceId: VAPI_BUILTIN_SET.has(dgClean) ? dgClean : 'asteria',
        model: config.voiceModel || config.voice?.model || 'aura-2',
      };
    }

    case '11labs':
    case 'elevenlabs':
      return {
        provider: '11labs',
        voiceId: cleanVoiceId,
        model: config.voiceModel || config.voice?.model || 'eleven_turbo_v2_5',
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        stability: config.voiceStability ?? config.voice?.stability ?? 0.5,
        similarityBoost: config.voiceSimilarityBoost ?? config.voice?.similarityBoost ?? 0.75,
        style: config.voiceStyle ?? config.voice?.style ?? 0.0,
        useSpeakerBoost: config.useSpeakerBoost ?? config.voice?.useSpeakerBoost ?? true,
      };

    case 'cartesia':
      return {
        provider: 'cartesia',
        voiceId: cleanVoiceId,
        model: config.voiceModel || config.voice?.model || 'sonic-3.5',
      };

    case 'openai':
      return {
        provider: 'openai',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        model: config.voiceModel || config.voice?.model || 'gpt-4o-mini-tts',
      };

    case 'azure':
      return {
        provider: 'azure',
        voiceId: cleanVoiceId,
      };

    case 'vapi':
      return {
        provider: 'vapi',
        voiceId: VAPI_BUILTIN_SET.has(lowerVoiceId) ? lowerVoiceId : 'asteria',
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        version: config.voiceVersion || config.voice?.version || '2',
      };

    case 'xai':
      return {
        provider: 'xai',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
      };

    case 'minimax':
      return {
        provider: 'minimax',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        model: config.voiceModel || config.voice?.model || 'speech-02-turbo',
      };

    case 'inworld':
      return {
        provider: 'inworld',
        voiceId: cleanVoiceId,
        model: 'inworld-tts-1',
      };

    case 'hume':
      return {
        provider: 'hume',
        voiceId: cleanVoiceId,
        model: config.voiceModel || config.voice?.model || 'octave2',
      };

    case 'lmnt':
      return {
        provider: 'lmnt',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
      };

    case 'neuphonic':
      return {
        provider: 'neuphonic',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        language: 'en',
      };

    case 'rime-ai':
    case 'rime':
      return {
        provider: 'rime-ai',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
        model: config.voiceModel || config.voice?.model || 'arcana',
      };

    case 'microsoft':
      return {
        provider: 'microsoft',
        voiceId: cleanVoiceId,
        speed: config.voiceSpeed ?? config.voice?.speed ?? 1.0,
      };

    case 'custom-voice':
      return {
        provider: 'custom-voice',
        voiceId: cleanVoiceId,
        server: config.voiceServer || config.voice?.server || { url: 'https://api.example.com/tts' },
      };

    default:
      return {
        provider: provider,
        voiceId: cleanVoiceId,
      };
  }
}

export function formatVapiBackgroundSound(sound?: string): 'off' | 'office' | string | undefined {
  if (!sound) return undefined;
  const s = sound.trim().toLowerCase();
  if (s === 'off' || s === 'none' || s === 'clean' || s === 'disabled') return 'off';
  if (s === 'office' || s === 'sales-office' || s === 'office-ambience' || s === 'coffee-shop' || s === 'cafe') return 'office';
  if (sound.startsWith('http://') || sound.startsWith('https://')) return sound;
  return 'off';
}

export async function createVapiRemoteAssistant(apiKey: string, name: string, config: any = {}): Promise<any> {
  if (!apiKey) throw new Error('Missing Vapi API Key');

  const payload: any = {
    name: name || config.name || 'New Vapi Sales Assistant',
  };

  if (config.model || config.llmModel || config.scriptPrompt) {
    payload.model = {
      provider: config.modelProvider || config.model?.provider || 'openai',
      model: config.llmModel || config.model?.model || 'gpt-4o-mini',
      temperature: config.temperature ?? config.model?.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? config.model?.maxTokens ?? 500,
      messages: [
        {
          role: 'system',
          content: config.scriptPrompt || config.model?.systemPrompt || 'You are an intelligent luxury real estate sales advisor.',
        },
      ],
    };
  }

  if (config.voice || config.voiceId || config.voiceProvider) {
    payload.voice = buildVapiVoicePayload(config);
  }

  if (config.transcriber || config.transcriberModel) {
    payload.transcriber = {
      provider: config.transcriberProvider || config.transcriber?.provider || 'deepgram',
      model: config.transcriberModel || config.transcriber?.model || 'nova-3',
      language: config.transcriberLanguage || config.transcriber?.language || 'en',
    };
  }

  if (config.firstMessage) payload.firstMessage = config.firstMessage;
  if (config.firstMessageMode) payload.firstMessageMode = config.firstMessageMode;
  if (config.backgroundSound !== undefined) {
    const sound = formatVapiBackgroundSound(config.backgroundSound);
    if (sound) payload.backgroundSound = sound;
  }
  if (config.silenceTimeoutSeconds) payload.silenceTimeoutSeconds = config.silenceTimeoutSeconds;
  if (config.maxDurationSeconds) payload.maxDurationSeconds = config.maxDurationSeconds;

  const res = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
    throw new Error(errMsg || `Vapi create assistant failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateVapiRemoteAssistant(apiKey: string, assistantId: string, config: any = {}): Promise<any> {
  if (!apiKey) throw new Error('Missing Vapi API Key');

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assistantId || '');
  if (!assistantId || assistantId === 'default' || assistantId === 'new' || !isUUID) {
    return createVapiRemoteAssistant(apiKey, config.name || 'New Vapi Sales Assistant', config);
  }

  const patchPayload: any = {};
  if (config.name) patchPayload.name = config.name;
  if (config.firstMessage !== undefined) patchPayload.firstMessage = config.firstMessage;
  if (config.firstMessageMode !== undefined) patchPayload.firstMessageMode = config.firstMessageMode;
  if (config.backgroundSound !== undefined) {
    const sound = formatVapiBackgroundSound(config.backgroundSound);
    if (sound) patchPayload.backgroundSound = sound;
  }
  if (config.silenceTimeoutSeconds !== undefined) patchPayload.silenceTimeoutSeconds = config.silenceTimeoutSeconds;
  if (config.maxDurationSeconds !== undefined) patchPayload.maxDurationSeconds = config.maxDurationSeconds;
  if (config.backchannelingEnabled !== undefined) patchPayload.backchannelingEnabled = config.backchannelingEnabled;
  if (config.backgroundDenoisingEnabled !== undefined) patchPayload.backgroundDenoisingEnabled = config.backgroundDenoisingEnabled;
  if (config.voicemailMessage !== undefined) patchPayload.voicemailMessage = config.voicemailMessage;

  // Build model object
  if (config.llmModel || config.scriptPrompt || config.model) {
    patchPayload.model = {
      provider: config.modelProvider || config.model?.provider || 'openai',
      model: config.llmModel || config.model?.model || 'gpt-4o-mini',
      temperature: config.temperature ?? config.model?.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? config.model?.maxTokens ?? 500,
      messages: [
        {
          role: 'system',
          content: config.scriptPrompt || config.model?.systemPrompt || 'You are an intelligent luxury real estate sales advisor.',
        },
      ],
    };
  }

  // Build voice object strictly compliant with selected provider
  if (config.voiceId || config.voiceProvider || config.voice) {
    patchPayload.voice = buildVapiVoicePayload(config);
  }

  // Build transcriber object
  if (config.transcriberModel || config.transcriberLanguage || config.transcriber) {
    patchPayload.transcriber = {
      provider: config.transcriberProvider || config.transcriber?.provider || 'deepgram',
      model: config.transcriberModel || config.transcriber?.model || 'nova-3',
      language: config.transcriberLanguage || config.transcriber?.language || 'en',
    };
  }

  const res = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
    if (res.status === 404 || errMsg?.includes('UUID') || errMsg?.includes('not found')) {
      return createVapiRemoteAssistant(apiKey, config.name || 'New Vapi Sales Assistant', config);
    }
    throw new Error(errMsg || `Vapi update assistant failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteVapiRemoteAssistant(apiKey: string, assistantId: string): Promise<any> {
  if (!apiKey) throw new Error('Missing Vapi API Key');
  if (!assistantId) throw new Error('Missing Assistant ID');

  const res = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
    throw new Error(errMsg || `Vapi delete assistant failed with HTTP ${res.status}`);
  }

  return res.json();
}
