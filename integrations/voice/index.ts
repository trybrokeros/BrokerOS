// ============================================================================
// BrokerOS — Universal Voice Integrations Registry & Decoupled Architecture
// ============================================================================

// Telephony Carriers
export { TwilioTelephonyClient } from '@brokeros/int-telephony-twilio';
export { VobizTelephonyClient } from '@brokeros/int-telephony-vobiz';
export { ExotelTelephonyClient } from '@brokeros/int-telephony-exotel';
export { TelnyxTelephonyClient } from '@brokeros/int-telephony-telnyx';

// AI Voice Agent Engines
export { VapiAgentClient } from '@brokeros/int-agent-vapi';
export { RetellAgentClient } from '@brokeros/int-agent-retell';
export { ElevenLabsAgentClient } from '@brokeros/int-agent-elevenlabs';
export { SarvamAgentClient } from '@brokeros/int-agent-sarvam';
export { BolnaAgentClient } from '@brokeros/int-agent-bolna';
export { PipecatAgentClient } from '@brokeros/int-agent-pipecat';
export { LiveKitAgentClient } from '@brokeros/int-agent-livekit';
export { OpenAIRealtimeAgentClient } from '@brokeros/int-agent-openai-realtime';

import type {
  IVoiceTelephonyProvider,
  IVoiceAgentProvider,
  VoiceTelephonyType,
  VoiceAgentPlatform,
  VoiceTelephonyCredentials,
  VoiceAgentCredentials,
  SendVoiceOptions,
  SendVoiceResult,
} from '@brokeros/types';

import { TwilioTelephonyClient } from '@brokeros/int-telephony-twilio';
import { VobizTelephonyClient } from '@brokeros/int-telephony-vobiz';
import { ExotelTelephonyClient } from '@brokeros/int-telephony-exotel';
import { TelnyxTelephonyClient } from '@brokeros/int-telephony-telnyx';

import { VapiAgentClient } from '@brokeros/int-agent-vapi';
import { RetellAgentClient } from '@brokeros/int-agent-retell';
import { ElevenLabsAgentClient } from '@brokeros/int-agent-elevenlabs';
import { SarvamAgentClient } from '@brokeros/int-agent-sarvam';
import { BolnaAgentClient } from '@brokeros/int-agent-bolna';
import { PipecatAgentClient } from '@brokeros/int-agent-pipecat';
import { LiveKitAgentClient } from '@brokeros/int-agent-livekit';
import { OpenAIRealtimeAgentClient } from '@brokeros/int-agent-openai-realtime';

export interface CarrierBridgeResult {
  handled: boolean;
  result?: SendVoiceResult;
}

function isPublicHttpUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;
  if (lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('0.0.0.0')) return false;
  return true;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Checks if carrier credentials (Vobiz, Exotel, Twilio, Telnyx) are present in SendVoiceOptions
 * and dispatches the call directly through the selected carrier's PSTN trunking line.
 */
export async function tryCarrierBridgeDispatch(
  platform: VoiceAgentPlatform,
  options: SendVoiceOptions,
): Promise<CarrierBridgeResult> {
  const telCreds = options.telephonyCredentials;
  if (!telCreds) {
    return { handled: false };
  }

  const message = options.firstMessage || 'Hello! Thank you for connecting with us.';
  const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
  const isPublicUrl = isPublicHttpUrl(publicUrl);
  const prov = (telCreds.provider || '').toUpperCase();

  // ── 1. VOBIZ PSTN Carrier Bridge ──
  const isVobiz =
    prov === 'VOBIZ' ||
    (!prov && telCreds.apiKey && telCreds.apiToken && !telCreds.subdomain && !telCreds.accountSid);

  if (isVobiz) {
    const id = telCreds.apiKey || telCreds.accountSid;
    const token = telCreds.apiToken || telCreds.authToken;
    const cleanTo = options.toPhone.replace(/[^\d+]/g, '');
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d+]/g, '');

    if (!id || !token) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Vobiz Auth ID and Auth Token are required in Telephony Settings.',
        },
      };
    }
    if (!cleanFrom) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Vobiz requires a registered Caller ID / From number in Telephony Settings.',
        },
      };
    }

    if (!isPublicUrl) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Vobiz API requires a public HTTP/HTTPS webhook URL for 'answer_url'. Current API_PUBLIC_URL is "${publicUrl || 'empty'}". Please configure a public domain or ngrok tunnel in your .env (e.g., API_PUBLIC_URL="https://your-domain.ngrok-free.app").`,
        },
      };
    }

    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?campaignId=${encodeURIComponent(options.campaignId || 'direct_test')}&agent=${encodeURIComponent(platform)}&voice=${encodeURIComponent(options.voiceId || '')}`;

    try {
      const res = await fetch(`https://api.vobiz.ai/api/v1/Account/${id}/Call/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-ID': id,
          'X-Auth-Token': token,
          Authorization: `Basic ${Buffer.from(`${id}:${token}`).toString('base64')}`,
        },
        body: JSON.stringify({
          to: cleanTo,
          from: cleanFrom,
          answer_url: answerUrl,
          answer_method: 'GET',
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (res.status >= 200 && res.status < 300) {
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.callId || data.call_uuid || data.request_uuid || `vobiz_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      } else {
        const errorDetail = data.error || data.message || data.detail || `HTTP ${res.status}`;
        return {
          handled: true,
          result: {
            success: false,
            error: `Vobiz call failed (HTTP ${res.status}): ${errorDetail}`,
          },
        };
      }
    } catch (err: any) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Vobiz network error: ${err?.message || String(err)}`,
        },
      };
    }
  }

  // ── 2. EXOTEL PSTN Carrier Bridge ──
  const isExotel =
    prov === 'EXOTEL' ||
    (!prov && telCreds.subdomain && (telCreds.accountSid || telCreds.apiKey));

  if (isExotel) {
    const k = telCreds.apiKey || telCreds.accountSid;
    const tok = telCreds.apiToken || telCreds.authToken;
    const sid = telCreds.accountSid || telCreds.apiKey;
    const domain = telCreds.subdomain || 'api.in.exotel.com';
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d]/g, '');
    let cleanTo = options.toPhone.replace(/[^\d]/g, '');
    if (cleanTo.startsWith('91') && cleanTo.length === 12) cleanTo = '0' + cleanTo.slice(2);
    else if (cleanTo.length === 10) cleanTo = '0' + cleanTo;

    if (!k || !tok || !sid) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Exotel API Key, Token, and Account SID are required in Telephony Settings.',
        },
      };
    }
    if (!cleanFrom) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Exotel requires a registered Caller ID / Virtual Number in Telephony Settings.',
        },
      };
    }

    try {
      const authHeader = Buffer.from(`${k}:${tok}`).toString('base64');
      const body = new URLSearchParams({
        From: cleanTo,
        To: cleanFrom,
        CallerId: cleanFrom,
        CallType: 'trans',
        TimeLimit: '60',
        TimeOut: '30',
      });

      const res = await fetch(`https://${domain}/v1/Accounts/${sid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (res.status >= 200 && res.status < 300) {
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data?.Call?.Sid || data?.sid || `exotel_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      } else {
        const errorDetail = data?.RestException?.Message || data?.message || `HTTP ${res.status}`;
        return {
          handled: true,
          result: {
            success: false,
            error: `Exotel call failed (HTTP ${res.status}): ${errorDetail}`,
          },
        };
      }
    } catch (err: any) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Exotel network error: ${err?.message || String(err)}`,
        },
      };
    }
  }

  // ── 3. TWILIO PSTN Carrier Bridge ──
  const isTwilio =
    prov === 'TWILIO' ||
    (!prov && (telCreds.accountSid || (telCreds.apiKey && telCreds.apiToken)));

  if (isTwilio) {
    const sid = telCreds.accountSid || telCreds.apiKey;
    const token = telCreds.authToken || telCreds.apiToken;
    const fromNum = options.fromNumber || telCreds.fromNumbers?.[0] || '';

    if (!sid || !token) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Twilio Account SID and Auth Token are required in Telephony Settings.',
        },
      };
    }
    if (!fromNum) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Twilio requires at least one registered Caller ID / From number in Telephony Settings.',
        },
      };
    }

    try {
      const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');
      const bodyParams: Record<string, string> = {
        To: options.toPhone,
        From: fromNum,
      };

      const twiml = `<Response><Say voice="Polly.Aditi">${escapeXml(message)}</Say><Pause length="2"/><Hangup/></Response>`;
      bodyParams.Twiml = twiml;

      const body = new URLSearchParams(bodyParams);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (res.status >= 200 && res.status < 300) {
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.sid || `twilio_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      } else {
        return {
          handled: true,
          result: {
            success: false,
            error: `Twilio call failed (HTTP ${res.status}): ${data.message || data.detail || res.statusText}`,
          },
        };
      }
    } catch (err: any) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Twilio network error: ${err?.message || String(err)}`,
        },
      };
    }
  }

  // ── 4. TELNYX PSTN Carrier Bridge ──
  const isTelnyx =
    prov === 'TELNYX' ||
    (!prov && telCreds.apiKey && (telCreds.apiKey.startsWith('KEY') || (!telCreds.apiToken && !telCreds.authToken && !telCreds.accountSid)));

  if (isTelnyx) {
    const key = telCreds.apiKey || telCreds.apiToken || telCreds.authToken;
    const cleanTo = options.toPhone.startsWith('+') ? options.toPhone : `+${options.toPhone.replace(/[^\d]/g, '')}`;
    const cleanFrom = (options.fromNumber || telCreds.fromNumbers?.[0] || '').startsWith('+')
      ? options.fromNumber || telCreds.fromNumbers?.[0]
      : `+${(options.fromNumber || telCreds.fromNumbers?.[0] || '').replace(/[^\d]/g, '')}`;

    if (!key) {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Telnyx API Key is required in Telephony Settings.',
        },
      };
    }
    if (!cleanFrom || cleanFrom === '+') {
      return {
        handled: true,
        result: {
          success: false,
          error: 'Telnyx requires a registered Caller ID / Phone Number in Telephony Settings.',
        },
      };
    }

    if (!isPublicUrl) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Telnyx API requires a public HTTP/HTTPS webhook URL for 'Url'. Current API_PUBLIC_URL is "${publicUrl || 'empty'}". Please configure a public domain or ngrok tunnel in your .env.`,
        },
      };
    }

    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/telnyx-answer?campaignId=${encodeURIComponent(options.campaignId || 'direct_test')}&agent=${encodeURIComponent(platform)}&voice=${encodeURIComponent(options.voiceId || '')}`;

    try {
      const res = await fetch('https://api.telnyx.com/v2/texml/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          To: cleanTo,
          From: cleanFrom,
          Url: answerUrl,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (res.status >= 200 && res.status < 300) {
        return {
          handled: true,
          result: {
            success: true,
            providerCallId: data.call_sid || data.data?.call_control_id || `telnyx_${platform.toLowerCase()}_${Date.now()}`,
          },
        };
      } else {
        const detail = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || data?.message;
        return {
          handled: true,
          result: {
            success: false,
            error: `Telnyx call failed (HTTP ${res.status}): ${detail || res.statusText}`,
          },
        };
      }
    } catch (err: any) {
      return {
        handled: true,
        result: {
          success: false,
          error: `Telnyx network error: ${err?.message || String(err)}`,
        },
      };
    }
  }

  return { handled: false };
}

export interface VoiceAgentPlatformMetadata {
  platform: VoiceAgentPlatform;
  displayName: string;
  badge: string;
  category: 'ORCHESTRATED_HUB' | 'STREAMING_ENGINE';
  hasNativePstn: boolean;
  supportsCarrierBridge: boolean;
  hasIndicVoices: boolean;
  averageLatencyMs: number;
  description: string;
}

export const VOICE_AGENT_REGISTRY: Record<VoiceAgentPlatform, VoiceAgentPlatformMetadata> = {
  VAPI: {
    platform: 'VAPI',
    displayName: 'Vapi AI',
    badge: 'Multi-Model Voice Hub',
    category: 'ORCHESTRATED_HUB',
    hasNativePstn: true,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 400,
    description: 'Multi-model orchestrator with assistant overrides, transient prompts, and dynamic variables.',
  },
  RETELL: {
    platform: 'RETELL',
    displayName: 'Retell AI',
    badge: 'Sub-500ms Engine',
    category: 'ORCHESTRATED_HUB',
    hasNativePstn: true,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 350,
    description: 'Ultra-low latency turn-taking conversational voice engine with SIP trunking support.',
  },
  BOLNA: {
    platform: 'BOLNA',
    displayName: 'Bolna AI',
    badge: 'Multi-Carrier Agent',
    category: 'ORCHESTRATED_HUB',
    hasNativePstn: true,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 450,
    description: 'Enterprise voice agent framework with native Vobiz, Exotel, and Twilio carrier connectors.',
  },
  SARVAM: {
    platform: 'SARVAM',
    displayName: 'Sarvam AI (India)',
    badge: 'Indic Languages (Bulbul v3)',
    category: 'STREAMING_ENGINE',
    hasNativePstn: false,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 250,
    description: 'India-optimized voice intelligence with Bulbul v3 Indic TTS and Saaras v3 STT across 23 languages.',
  },
  ELEVENLABS: {
    platform: 'ELEVENLABS',
    displayName: 'ElevenLabs Conversational',
    badge: 'Ultra-Realistic TTS',
    category: 'STREAMING_ENGINE',
    hasNativePstn: false,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 300,
    description: 'Industry-leading neural voice synthesis with expressive emotional conversational AI agents.',
  },
  LIVEKIT: {
    platform: 'LIVEKIT',
    displayName: 'LiveKit Agents',
    badge: 'WebRTC / SIP Participant',
    category: 'STREAMING_ENGINE',
    hasNativePstn: false,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 150,
    description: 'Real-time WebRTC and SIP participant infrastructure for scalable real-time voice bots.',
  },
  OPENAI_REALTIME: {
    platform: 'OPENAI_REALTIME',
    displayName: 'OpenAI Realtime API',
    badge: 'Speech-to-Speech GPT-4o',
    category: 'STREAMING_ENGINE',
    hasNativePstn: false,
    supportsCarrierBridge: true,
    hasIndicVoices: false,
    averageLatencyMs: 200,
    description: 'Native speech-to-speech bidirectional audio model with low-latency WebSocket streaming.',
  },
  PIPECAT: {
    platform: 'PIPECAT',
    displayName: 'Pipecat AI',
    badge: 'Daily WebRTC / SIP Pipeline',
    category: 'STREAMING_ENGINE',
    hasNativePstn: false,
    supportsCarrierBridge: true,
    hasIndicVoices: true,
    averageLatencyMs: 180,
    description: 'Real-time pipeline framework for multimodal AI with Daily WebRTC & SIP audio transports.',
  },
};

export function getVoiceAgentMetadata(platform: VoiceAgentPlatform): VoiceAgentPlatformMetadata {
  return VOICE_AGENT_REGISTRY[platform] || VOICE_AGENT_REGISTRY.VAPI;
}

export function listAllVoiceAgentMetadata(): VoiceAgentPlatformMetadata[] {
  return Object.values(VOICE_AGENT_REGISTRY);
}

export function getTelephonyAnswerUrl(
  carrier: 'vobiz' | 'twilio' | 'exotel',
  options: {
    campaignId?: string;
    recipientId?: string;
    firstMessage?: string;
    scriptPrompt?: string;
    agentPlatform?: string;
    voiceId?: string;
  } = {},
): string {
  const publicUrl = (
    process.env.API_PUBLIC_URL ||
    process.env.BETTER_AUTH_URL ||
    ''
  ).replace(/\/$/, '');

  const params = new URLSearchParams();
  if (options.campaignId) params.set('campaignId', options.campaignId);
  if (options.recipientId) params.set('recipientId', options.recipientId);
  if (options.firstMessage) params.set('firstMessage', options.firstMessage);
  if (options.agentPlatform) params.set('agent', options.agentPlatform);
  if (options.voiceId) params.set('voice', options.voiceId);

  return `${publicUrl}/api/marketing/voice/webhooks/${carrier}-answer?${params.toString()}`;
}


export function getVoiceTelephonyProvider(
  type: VoiceTelephonyType,
  credentials?: VoiceTelephonyCredentials,
): IVoiceTelephonyProvider {
  switch (type) {
    case 'TWILIO':
      return new TwilioTelephonyClient(credentials);
    case 'VOBIZ':
      return new VobizTelephonyClient(credentials);
    case 'EXOTEL':
      return new ExotelTelephonyClient(credentials);
    case 'TELNYX':
      return new TelnyxTelephonyClient(credentials);
    default:
      return new TwilioTelephonyClient(credentials);
  }
}

export function getVoiceAgentProvider(
  platform: VoiceAgentPlatform,
  credentials?: VoiceAgentCredentials,
): IVoiceAgentProvider {
  switch (platform) {
    case 'VAPI':
      return new VapiAgentClient(credentials);
    case 'RETELL':
      return new RetellAgentClient(credentials);
    case 'ELEVENLABS':
      return new ElevenLabsAgentClient(credentials);
    case 'SARVAM':
      return new SarvamAgentClient(credentials);
    case 'BOLNA':
      return new BolnaAgentClient(credentials);
    case 'PIPECAT':
      return new PipecatAgentClient(credentials);
    case 'LIVEKIT':
      return new LiveKitAgentClient(credentials);
    case 'OPENAI_REALTIME':
      return new OpenAIRealtimeAgentClient(credentials);
    default:
      return new VapiAgentClient(credentials);
  }
}
