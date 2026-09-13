// ============================================================================
// BrokerOS — WhatsApp Marketing Meta Conversation Pricing & Tier Constants
// ============================================================================

import { USD_TO_INR_EXCHANGE_RATE } from '../campaign.js';

export type WhatsAppConversationCategory =
  | 'MARKETING'
  | 'UTILITY'
  | 'AUTHENTICATION'
  | 'SERVICE';

export interface WhatsAppCategoryPricing {
  category: WhatsAppConversationCategory;
  name: string;
  description: string;
  costPerConversationINR: number;
  costPerConversationUSD: number;
  color: string;
}

/**
 * Standard Meta Cloud API 24h conversation pricing (India rate card standard)
 * 1 USD = 95 INR
 */
export const WA_CONVERSATION_PRICING: Record<
  WhatsAppConversationCategory,
  WhatsAppCategoryPricing
> = {
  MARKETING: {
    category: 'MARKETING',
    name: 'Marketing Conversation',
    description: 'Promotional broadcasts, new project launches, price offers, and discounts.',
    costPerConversationINR: 0.80,
    costPerConversationUSD: Number((0.80 / USD_TO_INR_EXCHANGE_RATE).toFixed(4)), // ~$0.0084
    color: '#8B5CF6',
  },
  UTILITY: {
    category: 'UTILITY',
    name: 'Utility Conversation',
    description: 'Site visit confirmations, booking receipts, payment schedules, and account updates.',
    costPerConversationINR: 0.30,
    costPerConversationUSD: Number((0.30 / USD_TO_INR_EXCHANGE_RATE).toFixed(4)), // ~$0.0032
    color: '#0284C7',
  },
  AUTHENTICATION: {
    category: 'AUTHENTICATION',
    name: 'Authentication Conversation',
    description: 'One-time passcodes, verification codes, and security logins.',
    costPerConversationINR: 0.15,
    costPerConversationUSD: Number((0.15 / USD_TO_INR_EXCHANGE_RATE).toFixed(4)), // ~$0.0016
    color: '#D97706',
  },
  SERVICE: {
    category: 'SERVICE',
    name: 'Service Conversation',
    description: 'User-initiated inquiries and CRM support within active 24h window.',
    costPerConversationINR: 0.00,
    costPerConversationUSD: 0.00,
    color: '#10B981',
  },
};

export interface WhatsAppMessagingTierInfo {
  tier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  label: string;
  dailyLimit: number;
  description: string;
}

export const WA_MESSAGING_TIERS: Record<string, WhatsAppMessagingTierInfo> = {
  TIER_1K: {
    tier: 'TIER_1K',
    label: 'Tier 1 (1,000 / day)',
    dailyLimit: 1000,
    description: 'Initial Meta sandbox tier. Maximum 1,000 business-initiated conversations in 24 hours.',
  },
  TIER_10K: {
    tier: 'TIER_10K',
    label: 'Tier 2 (10,000 / day)',
    dailyLimit: 10000,
    description: 'Standard enterprise tier. Up to 10,000 unique recipients in rolling 24 hours.',
  },
  TIER_100K: {
    tier: 'TIER_100K',
    label: 'Tier 3 (100,000 / day)',
    dailyLimit: 100000,
    description: 'High-volume tier. Up to 100,000 unique recipients in rolling 24 hours.',
  },
  TIER_UNLIMITED: {
    tier: 'TIER_UNLIMITED',
    label: 'Tier 4 (Unlimited)',
    dailyLimit: Infinity,
    description: 'Unlimited unique recipients per 24 hours with high phone number quality rating.',
  },
};

/**
 * Compute broadcast cost in both INR and USD with 1 USD = 95 INR exchange rate
 */
export function calculateWhatsAppBroadcastCost(
  audienceCount: number,
  category: WhatsAppConversationCategory | string = 'MARKETING',
  customRateINR?: number,
) {
  const normCategory = (category || 'MARKETING').toUpperCase() as WhatsAppConversationCategory;
  const pricing = WA_CONVERSATION_PRICING[normCategory] || WA_CONVERSATION_PRICING.MARKETING;
  const rateINR = customRateINR !== undefined ? customRateINR : pricing.costPerConversationINR;
  const totalCostINR = audienceCount * rateINR;
  const totalCostUSD = totalCostINR / USD_TO_INR_EXCHANGE_RATE;
  const rateUSD = rateINR / USD_TO_INR_EXCHANGE_RATE;

  return {
    totalAudience: audienceCount,
    category: normCategory,
    rateINR,
    rateUSD,
    totalCostINR,
    totalCostUSD,
    exchangeRate: USD_TO_INR_EXCHANGE_RATE,
    categoryName: pricing.name,
    categoryColor: pricing.color,
  };
}
