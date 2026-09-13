// ============================================================================
// BrokerOS — Voice Telephony & AI Agent Pricing Estimates (1 USD = 95 INR)
// ============================================================================

import { USD_TO_INR_EXCHANGE_RATE } from '../campaign.js';

export const VOICE_TELEPHONY_PRICING_ESTIMATES = {
  TWILIO: {
    costPerMinuteUSD: 0.014,
    costPerMinuteINR: Number((0.014 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Twilio Voice (~₹1.33/min)',
  },
  VOBIZ: {
    costPerMinuteUSD: 0.008,
    costPerMinuteINR: Number((0.008 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Vobiz Telecom (~₹0.76/min)',
  },
  EXOTEL: {
    costPerMinuteUSD: 0.007,
    costPerMinuteINR: Number((0.007 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Exotel DLT (~₹0.67/min)',
  },
  TELNYX: {
    costPerMinuteUSD: 0.009,
    costPerMinuteINR: Number((0.009 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Telnyx Backbone (~₹0.86/min)',
  },
  VONAGE: {
    costPerMinuteUSD: 0.012,
    costPerMinuteINR: Number((0.012 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Vonage Telecom (~₹1.14/min)',
  },
} as const;

export const VOICE_AGENT_PRICING_ESTIMATES = {
  SARVAM: {
    costPerMinuteUSD: 0.02,
    costPerMinuteINR: Number((0.02 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Sarvam Indic (~₹1.90/min)',
  },
  BOLNA: {
    costPerMinuteUSD: 0.03,
    costPerMinuteINR: Number((0.03 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Bolna Real Estate (~₹2.85/min)',
  },
  VAPI: {
    costPerMinuteUSD: 0.05,
    costPerMinuteINR: Number((0.05 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Vapi Orchestrator (~₹4.75/min)',
  },
  OPENAI_REALTIME: {
    costPerMinuteUSD: 0.06,
    costPerMinuteINR: Number((0.06 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'OpenAI Realtime (~₹5.70/min)',
  },
  RETELL: {
    costPerMinuteUSD: 0.07,
    costPerMinuteINR: Number((0.07 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Retell AI (~₹6.65/min)',
  },
  ELEVENLABS: {
    costPerMinuteUSD: 0.08,
    costPerMinuteINR: Number((0.08 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'ElevenLabs ConvAI (~₹7.60/min)',
  },
  LIVEKIT: {
    costPerMinuteUSD: 0.015,
    costPerMinuteINR: Number((0.015 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'LiveKit WebRTC (~₹1.43/min)',
  },
  PIPECAT: {
    costPerMinuteUSD: 0.01,
    costPerMinuteINR: Number((0.01 * USD_TO_INR_EXCHANGE_RATE).toFixed(2)),
    label: 'Pipecat Custom (~₹0.95/min)',
  },
} as const;

export interface VoiceCampaignCostEstimateOptions {
  totalLeads: number;
  telephonyProvider?: string;
  agentPlatform?: string;
  expectedConnectRate?: number; // default: 0.68 (68%)
  avgDurationMinutes?: number; // default: 2.0 mins
}

export function calculateVoiceCampaignCostEstimate(options: VoiceCampaignCostEstimateOptions) {
  const totalLeads = Number(options.totalLeads) || 0;
  const connectRate = options.expectedConnectRate ?? 0.68;
  const avgDuration = options.avgDurationMinutes ?? 2.0;

  const estimatedConnectedCalls = Math.round(totalLeads * connectRate);
  const estimatedConnectedMinutes = Math.round(estimatedConnectedCalls * avgDuration);

  const telKey = (options.telephonyProvider?.toUpperCase() || 'EXOTEL') as keyof typeof VOICE_TELEPHONY_PRICING_ESTIMATES;
  const telConfig = VOICE_TELEPHONY_PRICING_ESTIMATES[telKey] || VOICE_TELEPHONY_PRICING_ESTIMATES.EXOTEL;

  const agentKey = (options.agentPlatform?.toUpperCase() || 'VAPI') as keyof typeof VOICE_AGENT_PRICING_ESTIMATES;
  const agentConfig = VOICE_AGENT_PRICING_ESTIMATES[agentKey] || VOICE_AGENT_PRICING_ESTIMATES.VAPI;

  const telephonyCostUSD = Number((estimatedConnectedMinutes * telConfig.costPerMinuteUSD).toFixed(4));
  const telephonyCostINR = Number((estimatedConnectedMinutes * telConfig.costPerMinuteINR).toFixed(2));

  const agentCostUSD = Number((estimatedConnectedMinutes * agentConfig.costPerMinuteUSD).toFixed(4));
  const agentCostINR = Number((estimatedConnectedMinutes * agentConfig.costPerMinuteINR).toFixed(2));

  const totalCostUSD = Number((telephonyCostUSD + agentCostUSD).toFixed(4));
  const totalCostINR = Number((telephonyCostINR + agentCostINR).toFixed(2));

  return {
    totalLeads,
    estimatedConnectedCalls,
    estimatedConnectedMinutes,
    connectRatePercentage: Math.round(connectRate * 100),
    avgDurationMinutes: avgDuration,
    telephony: {
      provider: telKey,
      label: telConfig.label,
      costPerMinuteUSD: telConfig.costPerMinuteUSD,
      costPerMinuteINR: telConfig.costPerMinuteINR,
      totalUSD: telephonyCostUSD,
      totalINR: telephonyCostINR,
    },
    voiceAgent: {
      platform: agentKey,
      label: agentConfig.label,
      costPerMinuteUSD: agentConfig.costPerMinuteUSD,
      costPerMinuteINR: agentConfig.costPerMinuteINR,
      totalUSD: agentCostUSD,
      totalINR: agentCostINR,
    },
    blendedRatePerMinuteUSD: Number((telConfig.costPerMinuteUSD + agentConfig.costPerMinuteUSD).toFixed(4)),
    blendedRatePerMinuteINR: Number((telConfig.costPerMinuteINR + agentConfig.costPerMinuteINR).toFixed(2)),
    totalCostUSD,
    totalCostINR,
    usdToInrRate: USD_TO_INR_EXCHANGE_RATE,
  };
}
