// ============================================================================
// BrokerOS — Vapi AI Voice Agent Client
// ============================================================================

import type {
  IVoiceAgentProvider,
  SendVoiceOptions,
  SendVoiceResult,
  VoiceAgentCredentials,
  VoiceAgentPlatform,
  VoiceWebhookEvent,
  VoiceModelItem,
  VoicePersonaItem,
} from '@brokeros/types';
import {
  STANDARD_VAPI_MODELS,
  fetchVapiAccountModels,
  fetchVapiAccountAssistants,
  createVapiRemoteAssistant,
  updateVapiRemoteAssistant,
  deleteVapiRemoteAssistant,
} from './vapi-models.js';
import { NATIVE_VAPI_VOICES } from './vapi-voices.js';
import { parseVapiWebhookEvent } from './vapi-webhook-parser.js';
import { dispatchVapiOutboundCall } from './vapi-dispatcher.js';

export class VapiAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'VAPI';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.VAPI_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;
    try {
      const res = await fetch('https://api.vapi.ai/assistant', {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.status === 200;
    } catch {
      return key.length >= 20;
    }
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    return {
      audioBuffer: Buffer.from(text, 'utf-8'),
      contentType: 'audio/mpeg',
    };
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    const key = credentials?.apiKey || this.apiKey;

    if (!key) {
      return { success: false, error: 'Missing Vapi API Key' };
    }

    return dispatchVapiOutboundCall(key, options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseVapiWebhookEvent(payload);
  }

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    return fetchVapiAccountAssistants(credentials?.apiKey || this.apiKey);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    const dynamic = await fetchVapiAccountModels(credentials?.apiKey || this.apiKey);
    return [...dynamic, ...STANDARD_VAPI_MODELS];
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return NATIVE_VAPI_VOICES;
  }

  async createRemoteAssistant(name: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return createVapiRemoteAssistant(credentials?.apiKey || this.apiKey, name, config);
  }

  async updateRemoteAssistant(assistantId: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return updateVapiRemoteAssistant(credentials?.apiKey || this.apiKey, assistantId, config);
  }

  async deleteRemoteAssistant(assistantId: string, credentials?: VoiceAgentCredentials): Promise<boolean> {
    return deleteVapiRemoteAssistant(credentials?.apiKey || this.apiKey, assistantId);
  }
}
