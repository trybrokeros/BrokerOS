// ============================================================================
// BrokerOS — Retell AI Voice Agent Client
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
  STANDARD_RETELL_MODELS,
  fetchRetellAccountAgents,
  createRetellRemoteAgent,
  updateRetellRemoteAgent,
  deleteRetellRemoteAgent,
} from './retell-models.js';
import { RETELL_VOICES, fetchRetellAccountVoices } from './retell-voices.js';
import { parseRetellWebhookEvent } from './retell-webhook-parser.js';
import { dispatchRetellOutboundCall } from './retell-dispatcher.js';

export class RetellAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'RETELL';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.RETELL_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;
    try {
      const res = await fetch('https://api.retellai.com/list-agents', {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.status === 200;
    } catch {
      return key.startsWith('key_') || key.length >= 20;
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
      return { success: false, error: 'Missing Retell AI API Key' };
    }

    return dispatchRetellOutboundCall(key, options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseRetellWebhookEvent(payload);
  }

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    return fetchRetellAccountAgents(credentials?.apiKey || this.apiKey);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return STANDARD_RETELL_MODELS;
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return fetchRetellAccountVoices(credentials?.apiKey || this.apiKey);
  }

  async createRemoteAssistant(name: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return createRetellRemoteAgent(credentials?.apiKey || this.apiKey, name, config);
  }

  async updateRemoteAssistant(assistantId: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return updateRetellRemoteAgent(credentials?.apiKey || this.apiKey, assistantId, config);
  }

  async deleteRemoteAssistant(assistantId: string, credentials?: VoiceAgentCredentials): Promise<boolean> {
    return deleteRetellRemoteAgent(credentials?.apiKey || this.apiKey, assistantId);
  }
}
