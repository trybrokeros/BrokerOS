// ============================================================================
// BrokerOS — OpenAI Realtime AI Voice Agent Client
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
import { OPENAI_MODELS, fetchOpenAiModels } from './openai-models.js';
import { OPENAI_VOICES } from './openai-voices.js';
import { synthesizeOpenAiAudio } from './openai-dispatcher.js';

export class OpenAIRealtimeAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'OPENAI_REALTIME';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.OPENAI_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.status === 200;
    } catch {
      return key.startsWith('sk-') && key.length >= 20;
    }
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    return synthesizeOpenAiAudio(credentials?.apiKey || this.apiKey, text, voiceId);
  }

  async dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult> {
    return {
      success: true,
      providerCallId: `oai_rt_${Date.now()}`,
    };
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return [];
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return fetchOpenAiModels(credentials?.apiKey || this.apiKey);
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return OPENAI_VOICES;
  }
}
