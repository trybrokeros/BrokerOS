// ============================================================================
// BrokerOS — Voice Agent Platform Types & Interfaces
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from './options.js';
import type { VoiceWebhookEvent } from './webhook.js';

export type VoiceAgentPlatform =
  | 'VAPI'
  | 'RETELL'
  | 'ELEVENLABS'
  | 'SARVAM'
  | 'BOLNA'
  | 'PIPECAT'
  | 'LIVEKIT'
  | 'OPENAI_REALTIME';

export interface VoiceAgentCredentials {
  apiKey?: string;
  apiSecret?: string;
  orgId?: string;
  serverUrl?: string;
}

export interface VoiceModelItem {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  description?: string;
}

export interface VoicePersonaItem {
  id: string;
  name: string;
  provider: string;
  accent: string;
  gender: string;
  tags?: string[];
  previewUrl?: string;
  previewText?: string;
}

export interface IVoiceAgentProvider {
  readonly platformType: VoiceAgentPlatform;
  validateCredentials(credentials?: VoiceAgentCredentials): Promise<boolean>;
  previewAudio(
    text: string,
    voiceId: string,
    credentials?: VoiceAgentCredentials,
  ): Promise<{ audioBuffer: Buffer; contentType: string }>;
  dispatchOutboundCall(
    options: SendVoiceOptions,
    credentials?: VoiceAgentCredentials,
  ): Promise<SendVoiceResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): VoiceWebhookEvent[];
  getAvailableModels(credentials?: VoiceAgentCredentials): Promise<VoiceModelItem[]>;
  getAvailableVoices(credentials?: VoiceAgentCredentials): Promise<VoicePersonaItem[]>;
  getAccountAssistants?(credentials?: VoiceAgentCredentials): Promise<any[]>;
  createRemoteAssistant?(name: string, config: any, credentials?: VoiceAgentCredentials): Promise<any>;
  updateRemoteAssistant?(assistantId: string, config: any, credentials?: VoiceAgentCredentials): Promise<any>;
  deleteRemoteAssistant?(assistantId: string, credentials?: VoiceAgentCredentials): Promise<boolean>;
}
