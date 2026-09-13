// ============================================================================
// BrokerOS — Voice Call Sentiment to CRM Lead Temperature Mapping
// ============================================================================

export type VoiceSentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type LeadTemperatureType = 'HOT' | 'WARM' | 'COLD';

/**
 * Maps AI Voice conversational sentiment to CRM Lead Temperature:
 * - POSITIVE => HOT  (High intent, agreed to site visit, requested brochure/pricing)
 * - NEUTRAL  => WARM (Polite, requested callback, curious but non-committal)
 * - NEGATIVE => COLD (Not interested, wrong number, requested DND)
 */
export function mapVoiceSentimentToTemperature(
  sentiment?: string | null,
): LeadTemperatureType {
  if (!sentiment) return 'WARM';
  const s = sentiment.toUpperCase().trim();
  if (s === 'POSITIVE') return 'HOT';
  if (s === 'NEGATIVE') return 'COLD';
  return 'WARM';
}

export const VOICE_SENTIMENT_DISPLAY_CONFIG = {
  POSITIVE: {
    sentimentLabel: 'Positive',
    temperatureLabel: 'HOT',
    badgeVariant: 'success',
    colorHex: '#10B981',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200/60',
    description: 'High buying intent, confirmed budget or agreed to visit',
  },
  NEUTRAL: {
    sentimentLabel: 'Neutral',
    temperatureLabel: 'WARM',
    badgeVariant: 'default',
    colorHex: '#64748B',
    bgClass: 'bg-amber-50/70',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200/60',
    description: 'Answered, requested callback, needs follow-up',
  },
  NEGATIVE: {
    sentimentLabel: 'Negative',
    temperatureLabel: 'COLD',
    badgeVariant: 'danger',
    colorHex: '#EF4444',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200/60',
    description: 'Not interested, wrong number, or requested DND',
  },
} as const;
