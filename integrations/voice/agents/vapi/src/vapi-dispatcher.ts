// ============================================================================
// BrokerOS — Vapi API Outbound Call Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';
import { normalizeVapiVoice } from './vapi-voices.js';
import { buildVapiVoicePayload, formatVapiBackgroundSound } from './vapi-models.js';

export async function dispatchVapiOutboundCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  const isUUID = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const resolvedAssistantId = isUUID(options.assistantId)
    ? options.assistantId
    : isUUID(options.llmModel)
      ? options.llmModel
      : undefined;
  const isAssistantId = !!resolvedAssistantId;

  const payload: any = {
    customer: {
      number: options.toPhone,
    },
  };

  // Phone number configuration
  const twilioSid = options.telephonyCredentials?.accountSid || options.telephonyCredentials?.apiKey;
  const twilioToken = options.telephonyCredentials?.authToken || options.telephonyCredentials?.apiToken;
  const twilioNumber = options.fromNumber || options.telephonyCredentials?.fromNumbers?.[0] || '';

  if (twilioSid && twilioToken) {
    payload.phoneNumber = {
      twilioPhoneNumber: twilioNumber,
      twilioAccountSid: twilioSid,
      twilioAuthToken: twilioToken,
    };
  } else if (isUUID(options.fromNumber)) {
    payload.phoneNumberId = options.fromNumber;
  } else {
    // Look up registered phone numbers in Vapi account
    try {
      const pRes = await fetch('https://api.vapi.ai/phone-number', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (pRes.ok) {
        const numbers = (await pRes.json()) as any[];
        if (Array.isArray(numbers) && numbers.length > 0) {
          const cleanFrom = (options.fromNumber || '').replace(/[^\d+]/g, '');
          const match = cleanFrom
            ? numbers.find((n) => (n.number && n.number.replace(/[^\d+]/g, '') === cleanFrom) || n.id === options.fromNumber)
            : null;
          payload.phoneNumberId = match ? match.id : numbers[0].id;
        }
      }
    } catch {
      // Let Vapi return specific phone error
    }
  }

  const { provider: vapiVoiceProvider, voiceId: cleanVoiceId } = normalizeVapiVoice(
    options.voiceProvider,
    options.voiceId,
  );

  // Map Model Provider
  let vapiModelProvider = 'openai';
  let cleanModel = (options.llmModel || '').toLowerCase().replace(/^(openai\/|azure\/|groq\/|google\/|anthropic\/)/, '');
  let vapiModel = 'gpt-4o-mini';

  if (cleanModel.includes('gpt-4o-mini') || cleanModel.includes('gpt-4.1-mini') || cleanModel.includes('mini')) {
    vapiModelProvider = 'openai';
    vapiModel = 'gpt-4o-mini';
  } else if (cleanModel.includes('gpt-4o') || cleanModel.includes('gpt-4')) {
    vapiModelProvider = 'openai';
    vapiModel = 'gpt-4o';
  } else if (cleanModel.includes('claude-3-5-sonnet') || cleanModel.includes('sonnet')) {
    vapiModelProvider = 'anthropic';
    vapiModel = 'claude-3-5-sonnet-20241022';
  } else if (cleanModel.includes('claude-3-haiku') || cleanModel.includes('haiku')) {
    vapiModelProvider = 'anthropic';
    vapiModel = 'claude-3-haiku-20240307';
  } else if (cleanModel.includes('llama') || cleanModel.includes('groq')) {
    vapiModelProvider = 'groq';
    vapiModel = 'llama-3.3-70b-versatile';
  } else if (cleanModel.includes('gemini')) {
    vapiModelProvider = 'google';
    vapiModel = 'gemini-1.5-flash';
  }

  const voicemailConfig =
    options.voicemailDetection && options.voicemailDetection !== 'off' && options.voicemailDetection !== 'none'
      ? { provider: 'vapi' }
      : 'off';

  const waitSeconds = ((options.maxTurnSilenceMs ?? 400) / 1000);
  const startSpeakingPlan = { waitSeconds };

  const voicePayload = buildVapiVoicePayload({
    voiceProvider: vapiVoiceProvider,
    voiceId: cleanVoiceId,
    voiceSpeed: options.voiceSpeed,
  });

  const safeBgSound = formatVapiBackgroundSound(options.backgroundSound) || 'off';

  if (isAssistantId) {
    payload.assistantId = resolvedAssistantId;
    payload.assistantOverrides = {
      variableValues: options.variables || {},
      firstMessage: options.firstMessage,
      voicemailDetection: voicemailConfig,
      maxDurationSeconds: options.maxDurationSeconds || 600,
      backgroundSound: safeBgSound,
      startSpeakingPlan,
      voice: voicePayload,
      transcriber: {
        provider: 'deepgram',
        model: options.transcriberModel || 'nova-3',
        language: options.transcriberLanguage || 'en',
      },
    };
    if (options.scriptPrompt) {
      payload.assistantOverrides.model = {
        provider: vapiModelProvider,
        model: vapiModel,
        messages: [{ role: 'system', content: options.scriptPrompt }],
      };
    }
  } else {
    payload.assistant = {
      transcriber: {
        provider: 'deepgram',
        model: options.transcriberModel || 'nova-3',
        language: options.transcriberLanguage || 'en',
      },
      model: {
        provider: vapiModelProvider,
        model: vapiModel,
        messages: [
          {
            role: 'system',
            content: options.scriptPrompt || 'You are an intelligent real estate sales advisor.',
          },
        ],
      },
      voice: voicePayload,
      firstMessage: options.firstMessage,
      firstMessageMode: options.firstMessageMode || 'assistant-speaks-first',
      voicemailDetection: voicemailConfig,
      backgroundSound: safeBgSound,
      maxDurationSeconds: options.maxDurationSeconds || 600,
      startSpeakingPlan,
    };
  }

  try {
    const res = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.id || data.callId || `vapi_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: data.message || (Array.isArray(data.message) ? data.message.join('; ') : `Vapi dispatch failed with HTTP ${res.status}`),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch call via Vapi',
    };
  }
}
