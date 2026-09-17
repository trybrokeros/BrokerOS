// ============================================================================
// BrokerOS — Retell AI Model Catalog & Remote Agent Loader
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const STANDARD_RETELL_MODELS: VoiceModelItem[] = [
  // ── GPT-4.1 Series ──
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', badge: 'Stable', description: 'Reliable GPT-4.1 quality for outbound sales' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI', badge: 'Fast & Cost-Effective', description: 'Lowest latency conversational turns' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI', badge: 'Ultra Fast', description: 'Fastest GPT-4.1 tier, minimal cost' },
  // ── GPT-5 Series ──
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', badge: 'Most Capable', description: 'Full GPT-5 reasoning for complex sales conversations' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', badge: 'Recommended · Fast', description: 'Balanced speed & intelligence — great default' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', badge: 'Ultra Low Latency', description: 'Cost-effective with GPT-5 architecture' },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI', badge: 'Updated', description: 'GPT-5.1 generation' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', badge: 'Updated', description: 'GPT-5.2 generation' },
  { id: 'gpt-5.4', name: 'GPT-5.4', provider: 'OpenAI', badge: 'Advanced', description: 'GPT-5.4 generation' },
  { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', provider: 'OpenAI', badge: 'Fast', description: 'GPT-5.4 Mini generation' },
  { id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano', provider: 'OpenAI', badge: 'Lightest', description: 'GPT-5.4 Nano generation' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', badge: 'Latest Stable', description: 'GPT-5.5 generation' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', provider: 'OpenAI', badge: 'Retell Default ★', description: 'Retell\'s recommended default — best overall performance' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'OpenAI', badge: 'Latest', description: 'Latest GPT-5.6 generation' },
  // ── Claude Series ──
  { id: 'claude-4.5-sonnet', name: 'Claude 4.5 Sonnet', provider: 'Anthropic', badge: 'Empathetic', description: 'Deep conversational empathy & sophisticated real estate advice' },
  { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', provider: 'Anthropic', badge: 'Updated Sonnet', description: 'Latest Claude Sonnet generation' },
  { id: 'claude-5-sonnet', name: 'Claude 5 Sonnet', provider: 'Anthropic', badge: 'Most Capable Claude', description: 'Flagship Claude 5 for advanced conversations' },
  { id: 'claude-4.5-haiku', name: 'Claude 4.5 Haiku', provider: 'Anthropic', badge: 'Ultra Fast', description: 'Cost-effective high speed prompt traversal' },
  // ── Gemini Series ──
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', provider: 'Google', badge: 'Flash', description: 'Google Gemini Flash generation' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'Google', badge: 'Lightest Gemini', description: 'Lowest cost Gemini option' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Google', badge: 'Multimodal', description: 'Excellent multilingual and multimodal understanding' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', provider: 'Google', badge: 'Lite', description: 'Lightweight Gemini 3.5 Flash' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google', badge: 'Updated', description: 'Gemini 3.6 Flash generation' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'Google', badge: 'Latest', description: 'Gemini 3.7 Flash generation' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google', badge: 'Newest Gemini', description: 'Latest Gemini Flash generation' },
];

// Speech-to-Speech (S2S) models — bypasses TTS entirely
export const RETELL_S2S_MODELS = [
  { id: 'gpt-realtime-2.1', label: 'GPT Realtime 2.1', badge: 'Latest · Recommended' },
  { id: 'gpt-realtime-2.1-mini', label: 'GPT Realtime 2.1 Mini', badge: 'Fast Realtime' },
  { id: 'gpt-realtime-2', label: 'GPT Realtime 2', badge: 'Stable' },
  { id: 'gpt-realtime-1.5', label: 'GPT Realtime 1.5', badge: 'Previous Gen' },
];


export async function fetchRetellAccountAgents(apiKey: string): Promise<any[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.retellai.com/list-agents', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (Array.isArray(data)) {
        return Promise.all(
          data.map(async (a: any) => {
            let scriptPrompt = '';
            let firstMessage = '';
            let llmModel = 'gpt-5.6-terra';
            const llmId = a.response_engine?.llm_id;

            if (llmId) {
              try {
                const llmRes = await fetch(`https://api.retellai.com/get-retell-llm/${llmId}`, {
                  headers: { Authorization: `Bearer ${apiKey}` },
                });
                if (llmRes.ok) {
                  const llmData = (await llmRes.json()) as any;
                  scriptPrompt = llmData.general_prompt || '';
                  firstMessage = llmData.begin_message || '';
                  llmModel = llmData.model || llmModel;
                }
              } catch {
                // Ignore individual LLM fetch error
              }
            }

            return {
              id: a.agent_id,
              name: a.agent_name || a.agent_id,
              voice: {
                voiceId: a.voice_id,
                model: a.voice_model,
                speed: a.voice_speed,
                emotion: a.voice_emotion,
                temperature: a.voice_temperature,
              },
              model: {
                model: llmModel,
                type: a.response_engine?.type || 'retell-llm',
                llmId: llmId,
              },
              scriptPrompt,
              firstMessage,
              llmModel,
              language: a.language || 'en-US',
              ambientSound: a.ambient_sound,
              ambientSoundVolume: a.ambient_sound_volume,
              enableBackchannel: a.enable_backchannel,
              backchannelFrequency: a.backchannel_frequency,
              reminderTriggerMs: a.reminder_trigger_ms,
              reminderMaxCount: a.reminder_max_count,
              maxCallDurationMs: a.max_call_duration_ms,
              voicemailOption: a.voicemail_option,
              raw: a,
            };
          }),
        );
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createRetellRemoteAgent(apiKey: string, name: string, config: any = {}): Promise<any> {
  if (!apiKey) throw new Error('Missing Retell API Key');

  // 1. Resolve or Create Response Engine
  let responseEngine = config.responseEngine;
  if (!responseEngine) {
    if (config.llmId) {
      responseEngine = {
        type: 'retell-llm',
        llm_id: config.llmId,
      };
    } else {
      // Create a Retell LLM with the prompt & model
      const llmPayload: any = {
        general_prompt: config.scriptPrompt || config.prompt || config.systemPrompt || 'You are an intelligent real estate consultative agent.',
      };
      if (config.firstMessage) {
        llmPayload.begin_message = config.firstMessage;
      }
      if (config.s2sModel) {
        llmPayload.s2s_model = config.s2sModel;
      } else {
        llmPayload.model = config.llmModel || 'gpt-5.6-terra';
      }
      if (config.modelTemperature !== undefined || config.temperature !== undefined) {
        llmPayload.model_temperature = config.modelTemperature ?? config.temperature ?? 0;
      }
      if (config.modelHighPriority !== undefined) {
        llmPayload.model_high_priority = config.modelHighPriority;
      }

      const llmRes = await fetch('https://api.retellai.com/create-retell-llm', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(llmPayload),
      });

      if (!llmRes.ok) {
        const llmErr = await llmRes.json().catch(() => ({}));
        throw new Error(llmErr?.message || llmErr?.error_message || `Retell create-llm failed with HTTP ${llmRes.status}`);
      }

      const llmData = (await llmRes.json()) as any;
      responseEngine = {
        type: 'retell-llm',
        llm_id: llmData.llm_id,
      };
    }
  }

  // 2. Resolve Voice ID
  let voiceId = config.voiceId;
  try {
    const vListRes = await fetch('https://api.retellai.com/list-voices', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (vListRes.ok) {
      const vList = await vListRes.json();
      if (Array.isArray(vList) && vList.length > 0) {
        const validIds = new Set(vList.map((v: any) => v.voice_id || v.id));
        if (!voiceId || !validIds.has(voiceId)) {
          voiceId = vList[0].voice_id || vList[0].id;
        }
      }
    }
  } catch {
    // Ignore
  }
  if (!voiceId) {
    voiceId = '11labs-rachel';
  }

  // 3. Build Agent Payload
  const payload: any = {
    agent_name: name || config.name || config.agent_name || 'New Retell Sales Agent',
    voice_id: voiceId,
    response_engine: responseEngine,
    voice_speed: config.voiceSpeed ?? 1.0,
    voice_temperature: config.temperature ?? config.voiceTemperature ?? 1.0,
    language: config.retellLanguage || config.language || 'en-US',
    enable_backchannel: config.retellBackchannel ?? true,
    reminder_trigger_ms: config.retellReminderMs ?? 10000,
    max_call_duration_ms: (config.maxDurationSeconds || 600) * 1000,
  };

  if (config.retellVoiceModel || config.voiceModel) {
    payload.voice_model = config.retellVoiceModel || config.voiceModel;
  }
  if (config.retellEmotion || config.voiceEmotion) {
    payload.voice_emotion = config.retellEmotion || config.voiceEmotion;
  }
  if (config.retellAmbientSound !== undefined) {
    payload.ambient_sound = config.retellAmbientSound === 'none' || config.retellAmbientSound === 'clean' ? null : config.retellAmbientSound;
  }
  if (config.responsiveness !== undefined) {
    payload.responsiveness = config.responsiveness;
  }
  if (config.interruptionSensitivity !== undefined) {
    payload.interruption_sensitivity = config.interruptionSensitivity;
  }

  const res = await fetch('https://api.retellai.com/create-agent', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || err?.error_message || `Retell create agent failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateRetellRemoteAgent(apiKey: string, agentId: string, config: any = {}): Promise<any> {
  if (!apiKey) throw new Error('Missing Retell API Key');
  if (!agentId || agentId === 'default' || agentId === 'new') {
    return createRetellRemoteAgent(apiKey, config.name || config.agent_name || 'Retell Sales Agent', config);
  }

  // 1. Fetch current agent to verify existence and get linked LLM ID
  let existingAgent: any = null;
  try {
    const checkRes = await fetch(`https://api.retellai.com/get-agent/${agentId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (checkRes.ok) {
      existingAgent = await checkRes.json();
    }
  } catch {
    // Ignore fetch error
  }

  // If agent does not exist on Retell, gracefully create it
  if (!existingAgent) {
    return createRetellRemoteAgent(apiKey, config.name || config.agent_name || 'Retell Sales Agent', config);
  }

  // 2. Sync linked Retell LLM if prompt, firstMessage, or model changed
  const currentLlmId = existingAgent?.response_engine?.llm_id || config.llmId;
  const hasPromptOrModel =
    config.scriptPrompt !== undefined ||
    config.prompt !== undefined ||
    config.systemPrompt !== undefined ||
    config.firstMessage !== undefined ||
    config.llmModel !== undefined ||
    config.s2sModel !== undefined ||
    config.modelTemperature !== undefined;

  if (hasPromptOrModel) {
    if (currentLlmId) {
      try {
        const llmPatch: any = {};
        if (config.scriptPrompt !== undefined || config.prompt !== undefined || config.systemPrompt !== undefined) {
          llmPatch.general_prompt = config.scriptPrompt || config.prompt || config.systemPrompt;
        }
        if (config.firstMessage !== undefined) {
          llmPatch.begin_message = config.firstMessage;
        }
        if (config.s2sModel) {
          llmPatch.s2s_model = config.s2sModel;
        } else if (config.llmModel || config.model) {
          llmPatch.model = config.llmModel || config.model;
        }
        if (config.modelTemperature !== undefined || config.temperature !== undefined) {
          llmPatch.model_temperature = config.modelTemperature ?? config.temperature;
        }
        if (config.modelHighPriority !== undefined) {
          llmPatch.model_high_priority = config.modelHighPriority;
        }

        await fetch(`https://api.retellai.com/update-retell-llm/${currentLlmId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(llmPatch),
        });
      } catch {
        // Continue with agent patch
      }
    }
  }

  // 3. Update Agent parameters
  const patchPayload: any = {};
  if (config.name || config.agent_name) patchPayload.agent_name = config.name || config.agent_name;
  if (config.voiceId) patchPayload.voice_id = config.voiceId;
  if (config.retellVoiceModel || config.voiceModel) patchPayload.voice_model = config.retellVoiceModel || config.voiceModel;
  if (config.voiceSpeed !== undefined) patchPayload.voice_speed = config.voiceSpeed;
  if (config.retellEmotion || config.voiceEmotion) patchPayload.voice_emotion = config.retellEmotion || config.voiceEmotion;
  if (config.retellAmbientSound !== undefined) {
    patchPayload.ambient_sound = config.retellAmbientSound === 'none' || config.retellAmbientSound === 'clean' ? null : config.retellAmbientSound;
  }
  if (config.retellLanguage || config.language) patchPayload.language = config.retellLanguage || config.language;
  if (config.retellBackchannel !== undefined) patchPayload.enable_backchannel = config.retellBackchannel;
  if (config.retellReminderMs !== undefined) patchPayload.reminder_trigger_ms = config.retellReminderMs;
  if (config.maxDurationSeconds) patchPayload.max_call_duration_ms = config.maxDurationSeconds * 1000;
  if (config.responsiveness !== undefined) patchPayload.responsiveness = config.responsiveness;
  if (config.interruptionSensitivity !== undefined) patchPayload.interruption_sensitivity = config.interruptionSensitivity;

  const res = await fetch(`https://api.retellai.com/update-agent/${agentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchPayload),
  });

  if (!res.ok) {
    if (res.status === 404) {
      return createRetellRemoteAgent(apiKey, config.name || config.agent_name || 'Retell Sales Agent', config);
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || err?.error_message || `Retell update agent failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteRetellRemoteAgent(apiKey: string, agentId: string): Promise<boolean> {
  if (!apiKey) throw new Error('Missing Retell API Key');
  if (!agentId) throw new Error('Missing Agent ID');

  const res = await fetch(`https://api.retellai.com/delete-agent/${agentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return res.ok;
}
