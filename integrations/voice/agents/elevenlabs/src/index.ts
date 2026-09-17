// ============================================================================
// BrokerOS — ElevenLabs Conversational AI Voice Agent Client
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
  STANDARD_ELEVENLABS_MODELS,
  fetchElevenLabsModels,
  fetchElevenLabsAssistants,
  createElevenLabsRemoteAgent,
  updateElevenLabsRemoteAgent,
  deleteElevenLabsRemoteAgent,
} from './elevenlabs-models.js';
import { fetchElevenLabsVoices } from './elevenlabs-voices.js';
import { parseElevenLabsWebhookEvent } from './elevenlabs-webhook-parser.js';
import { dispatchElevenLabsCall } from './elevenlabs-dispatcher.js';

export class ElevenLabsAgentClient implements IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform = 'ELEVENLABS';
  private apiKey: string;

  constructor(credentials?: VoiceAgentCredentials) {
    this.apiKey = credentials?.apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  async validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) return false;
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/models', {
        method: 'GET',
        headers: { 'xi-api-key': key },
      });
      return res.status === 200;
    } catch {
      return key.length >= 24;
    }
  }

  async previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    const key = credentials?.apiKey || this.apiKey;
    if (!key) {
      return {
        audioBuffer: Buffer.from(text, 'utf-8'),
        contentType: 'audio/mpeg',
      };
    }

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'cjVigY5qzO86Huf0OWal'}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.8 },
          }),
        },
      );

      if (res.status === 200) {
        const arrayBuf = await res.arrayBuffer();
        return {
          audioBuffer: Buffer.from(arrayBuf),
          contentType: 'audio/mpeg',
        };
      }
    } catch {
      // fallback
    }

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
      return { success: false, error: 'Missing ElevenLabs API Key' };
    }

    return dispatchElevenLabsCall(key, options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[] {
    return parseElevenLabsWebhookEvent(payload);
  }

  async getAccountAssistants(credentials?: VoiceAgentCredentials): Promise<any[]> {
    return fetchElevenLabsAssistants(credentials?.apiKey || this.apiKey);
  }

  async getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]> {
    return fetchElevenLabsModels(credentials?.apiKey || this.apiKey);
  }

  async getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]> {
    return fetchElevenLabsVoices(credentials?.apiKey || this.apiKey);
  }

  async createRemoteAssistant(name: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return createElevenLabsRemoteAgent(credentials?.apiKey || this.apiKey, name, config);
  }

  async updateRemoteAssistant(assistantId: string, config: any, credentials?: VoiceAgentCredentials): Promise<any> {
    return updateElevenLabsRemoteAgent(credentials?.apiKey || this.apiKey, assistantId, config);
  }

  async deleteRemoteAssistant(assistantId: string, credentials?: VoiceAgentCredentials): Promise<boolean> {
    return deleteElevenLabsRemoteAgent(credentials?.apiKey || this.apiKey, assistantId);
  }
}
