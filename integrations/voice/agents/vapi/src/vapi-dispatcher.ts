// ============================================================================
// BrokerOS — Vapi API Outbound Call Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';
import { normalizeVapiVoice } from './vapi-voices.js';

export async function dispatchVapiOutboundCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  const isUUID = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const isAssistantId = isUUID(options.llmModel);

  const payload: any = {
    customer: {
      number: options.toPhone,
    },
  };

  // Phone number configuration
  if (options.telephonyCredentials?.accountSid && options.telephonyCredentials?.authToken) {
    payload.phoneNumber = {
      twilioPhoneNumber: options.fromNumber || options.telephonyCredentials.fromNumbers?.[0] || '',
      twilioAccountSid: options.telephonyCredentials.accountSid,
      twilioAuthToken: options.telephonyCredentials.authToken,
    };
  } else if (isUUID(options.fromNumber)) {
    payload.phoneNumberId = options.fromNumber;
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

  if (isAssistantId) {
    payload.assistantId = options.llmModel;
    payload.assistantOverrides = {
      variableValues: options.variables || {},
      firstMessage: options.firstMessage,
      voicemailDetection: voicemailConfig,
      maxDurationSeconds: options.maxDurationSeconds || 600,
      backgroundSound: options.backgroundSound || 'off',
      startSpeakingPlan,
      voice: {
        provider: vapiVoiceProvider,
        voiceId: cleanVoiceId,
        speed: options.voiceSpeed || 1.0,
      },
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
      voice: {
        provider: vapiVoiceProvider,
        voiceId: cleanVoiceId,
        speed: options.voiceSpeed || 1.0,
      },
      firstMessage: options.firstMessage,
      firstMessageMode: options.firstMessageMode || 'assistant-speaks-first',
      voicemailDetection: voicemailConfig,
      backgroundSound: options.backgroundSound || 'off',
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
