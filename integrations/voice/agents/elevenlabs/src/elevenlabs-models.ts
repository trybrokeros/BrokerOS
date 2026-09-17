// ============================================================================
// BrokerOS — ElevenLabs Conversational AI Models & Remote Agent Manager
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const STANDARD_ELEVENLABS_MODELS: VoiceModelItem[] = [
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', provider: 'ElevenLabs', badge: 'Ultra Fast · Recommended ★', description: 'Lowest latency (~75ms) conversational streaming for voice agents' },
  { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', provider: 'ElevenLabs', badge: 'High Quality · Fast', description: 'Exceptional speed and nuanced voice inflection' },
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', provider: 'ElevenLabs', badge: 'Multilingual Master', description: 'Rich 29-language natural synthesis with emotional depth' },
  { id: 'eleven_v3_conversational', name: 'Eleven v3 Conversational', provider: 'ElevenLabs', badge: 'Next-Gen v3', description: 'State-of-the-art conversational voice model with expressive controls' },
];

export async function fetchElevenLabsModels(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return STANDARD_ELEVENLABS_MODELS;
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          id: m.model_id,
          name: m.name || m.model_id,
          provider: 'ElevenLabs',
          badge: m.can_do_voice_conversion ? 'High Fidelity' : 'Standard',
          description: m.description || 'ElevenLabs Neural Speech Model',
        }));
      }
    }
  } catch {
    // fallback
  }
  return STANDARD_ELEVENLABS_MODELS;
}

export async function fetchElevenLabsAssistants(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const agentsList = Array.isArray(data) ? data : data.agents || [];
      return agentsList.map((a: any) => ({
        id: a.agent_id,
        name: a.name || a.agent_id,
        voice: {
          voiceId: a.conversation_config?.tts?.voice_id || 'cjVigY5qzO86Huf0OWal',
          model: a.conversation_config?.tts?.model_id || 'eleven_flash_v2_5',
          stability: a.conversation_config?.tts?.stability,
          similarityBoost: a.conversation_config?.tts?.similarity_boost,
          speed: a.conversation_config?.tts?.speed,
        },
        model: {
          model: a.conversation_config?.agent?.prompt?.llm || 'gpt-5.6-terra',
          systemPrompt: a.conversation_config?.agent?.prompt?.prompt || '',
          temperature: a.conversation_config?.agent?.prompt?.temperature,
          maxTokens: a.conversation_config?.agent?.prompt?.max_tokens,
        },
        firstMessage: a.conversation_config?.agent?.first_message || '',
        language: a.conversation_config?.agent?.language || 'en',
        turn: a.conversation_config?.turn,
        asr: a.conversation_config?.asr,
        conversation: a.conversation_config?.conversation,
        raw: a,
      }));
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createElevenLabsRemoteAgent(
  apiKey: string,
  name: string,
  config: any = {},
): Promise<any> {
  if (!apiKey) throw new Error('Missing ElevenLabs API Key');

  const conversationConfig: any = {
    agent: {
      prompt: {
        prompt: config.prompt || config.systemPrompt || 'You are an intelligent real estate consultative agent representing luxury developments.',
        llm: config.llmModel || config.model || 'gpt-5.6-terra',
        temperature: config.temperature ?? 0,
        max_tokens: config.maxTokens ?? -1,
      },
      first_message: config.firstMessage || 'Hello! Thank you for inquiring about our luxury property offerings.',
      language: config.elevenLanguage || config.language || 'en',
    },
    tts: {
      model_id: config.ttsModel || 'eleven_flash_v2_5',
      voice_id: config.voiceId || 'cjVigY5qzO86Huf0OWal',
      stability: config.voiceStability ?? 0.5,
      similarity_boost: config.voiceSimilarityBoost ?? 0.8,
      speed: config.voiceSpeed ?? 1.0,
      expressive_mode: config.expressiveMode ?? true,
    },
    turn: {
      turn_timeout: config.turnTimeout ?? 7,
      turn_eagerness: config.turnEagerness || 'normal',
      silence_end_call_timeout: config.silenceEndCallTimeout ?? -1,
      speculative_turn: config.speculativeTurn ?? true,
    },
    asr: {
      quality: config.asrQuality || 'high',
      provider: config.asrProvider || 'elevenlabs',
      keywords: config.asrKeywords || [],
    },
    conversation: {
      max_duration_seconds: config.maxDurationSeconds ?? 600,
    },
  };

  if (config.backgroundSound && config.backgroundSound !== 'none') {
    conversationConfig.conversation.background_sound = {
      source_type: 'preset',
      source_id: config.backgroundSound,
      volume: config.backgroundVolume ?? 0.15,
    };
  }

  const payload: any = {
    name: name || config.name || 'New ElevenLabs Real Estate Agent',
    conversation_config: conversationConfig,
  };

  const res = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || err?.message || `ElevenLabs create agent failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateElevenLabsRemoteAgent(
  apiKey: string,
  agentId: string,
  config: any = {},
): Promise<any> {
  if (!apiKey) throw new Error('Missing ElevenLabs API Key');
  if (!agentId) throw new Error('Missing Agent ID');

  const patchPayload: any = {};
  if (config.name) patchPayload.name = config.name;

  const conversationConfig: any = {};

  if (config.prompt || config.systemPrompt || config.llmModel || config.model || config.firstMessage || config.elevenLanguage || config.language || config.temperature !== undefined) {
    conversationConfig.agent = {
      prompt: {
        ...(config.prompt || config.systemPrompt ? { prompt: config.prompt || config.systemPrompt } : {}),
        ...(config.llmModel || config.model ? { llm: config.llmModel || config.model } : {}),
        ...(config.temperature !== undefined ? { temperature: config.temperature } : {}),
        ...(config.maxTokens !== undefined ? { max_tokens: config.maxTokens } : {}),
      },
      ...(config.firstMessage !== undefined ? { first_message: config.firstMessage } : {}),
      ...(config.elevenLanguage || config.language ? { language: config.elevenLanguage || config.language } : {}),
    };
  }

  if (config.ttsModel || config.voiceId || config.voiceStability !== undefined || config.voiceSimilarityBoost !== undefined || config.voiceSpeed !== undefined) {
    conversationConfig.tts = {
      ...(config.ttsModel ? { model_id: config.ttsModel } : {}),
      ...(config.voiceId ? { voice_id: config.voiceId } : {}),
      ...(config.voiceStability !== undefined ? { stability: config.voiceStability } : {}),
      ...(config.voiceSimilarityBoost !== undefined ? { similarity_boost: config.voiceSimilarityBoost } : {}),
      ...(config.voiceSpeed !== undefined ? { speed: config.voiceSpeed } : {}),
    };
  }

  if (config.turnTimeout !== undefined || config.turnEagerness || config.silenceEndCallTimeout !== undefined || config.speculativeTurn !== undefined) {
    conversationConfig.turn = {
      ...(config.turnTimeout !== undefined ? { turn_timeout: config.turnTimeout } : {}),
      ...(config.turnEagerness ? { turn_eagerness: config.turnEagerness } : {}),
      ...(config.silenceEndCallTimeout !== undefined ? { silence_end_call_timeout: config.silenceEndCallTimeout } : {}),
      ...(config.speculativeTurn !== undefined ? { speculative_turn: config.speculativeTurn } : {}),
    };
  }

  if (config.asrQuality || config.asrProvider || config.asrKeywords) {
    conversationConfig.asr = {
      ...(config.asrQuality ? { quality: config.asrQuality } : {}),
      ...(config.asrProvider ? { provider: config.asrProvider } : {}),
      ...(config.asrKeywords ? { keywords: config.asrKeywords } : {}),
    };
  }

  if (config.maxDurationSeconds !== undefined || config.backgroundSound !== undefined) {
    conversationConfig.conversation = {
      ...(config.maxDurationSeconds !== undefined ? { max_duration_seconds: config.maxDurationSeconds } : {}),
      ...(config.backgroundSound !== undefined
        ? config.backgroundSound === 'none'
          ? { background_sound: null }
          : {
              background_sound: {
                source_type: 'preset',
                source_id: config.backgroundSound,
                volume: config.backgroundVolume ?? 0.15,
              },
            }
        : {}),
    };
  }

  if (Object.keys(conversationConfig).length > 0) {
    patchPayload.conversation_config = conversationConfig;
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message || err?.message || `ElevenLabs update agent failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteElevenLabsRemoteAgent(apiKey: string, agentId: string): Promise<boolean> {
  if (!apiKey) throw new Error('Missing ElevenLabs API Key');
  if (!agentId) throw new Error('Missing Agent ID');

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  return res.ok;
}
