// ============================================================================
// BrokerOS — SMS Marketing Types & Interfaces
// ============================================================================

import type { AudienceSourceType, CampaignStatus } from './common.js';

export type SmsProviderType =
  | 'TWILIO'
  | 'AWS_SNS'
  | 'SINCH'
  | 'GUPSHUP'
  | 'MULTI_PROVIDER'
  | 'INFOBIP'
  | 'VONAGE'
  | 'TELNYX'
  | 'PLIVO'
  | 'BIRD';

export interface SmsRecipient {
  phone: string;
  name?: string;
  leadId?: string;
  brokerId?: string;
  source?: AudienceSourceType;
  segmentsCount?: number;
  mergeData?: Record<string, string | number | boolean | undefined>;
}

export interface SendSmsOptions {
  from: string; // E.164 phone number, MessagingServiceSid, or Alphanumeric Sender Header
  to: SmsRecipient[];
  message: string;
  campaignId?: string;
  dltTemplateId?: string; // Required for TRAI DLT compliance
  dltEntityId?: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: SmsProviderType;
  providerMessageId?: string;
  sentCount: number;
  segmentsEstimated?: number;
  failedRecipients?: Array<{ phone: string; reason: string }>;
  error?: string;
}

export interface SmsWebhookEvent {
  providerMessageId: string;
  campaignId?: string;
  recipientPhone: string;
  eventType: 'DELIVERED' | 'FAILED' | 'CLICKED';
  timestamp: Date;
  metadata?: {
    reason?: string;
    carrierCode?: string;
    linkUrl?: string;
  };
}

export interface DiscoveredSenderNumber {
  phoneNumber?: string;
  senderId?: string;
  provider: SmsProviderType;
  isVerified: boolean;
}

export interface SmsSenderNumberRecord {
  id: string;
  integrationId: string;
  phoneNumber?: string | null;
  senderId?: string | null;
  provider?: string | null;
  dailyQuota: number;
  sentToday: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  integration?: {
    id: string;
    name: string;
    provider: SmsProviderType;
  };
}

export interface CampaignSmsSenderPoolConfig {
  senderNumberId?: string;
  integrationId?: string;
  accountName?: string;
  allocationPercentage: number;
  allocatedLeads?: number;
  weight?: number;
  phoneNumber?: string;
  senderId?: string;
  provider?: SmsProviderType;
}

export interface CampaignSmsSenderPoolItem {
  id: string;
  campaignId: string;
  senderNumberId?: string | null;
  integrationId?: string | null;
  phoneNumber?: string | null;
  senderId?: string | null;
  provider?: string | null;
  weight: number;
  allocatedRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: string;
  senderNumber?: SmsSenderNumberRecord | null;
  integration?: {
    id: string;
    name: string;
    provider: SmsProviderType;
  } | null;
}

export interface SmsPreFlightCostLineItem {
  provider: SmsProviderType;
  providerName: string;
  phoneNumber?: string;
  senderId?: string;
  allocatedLeads: number;
  percentage: number;
  estimatedSegments: number;
  costPerSegmentUSD: number;
  costUSD: number;
  costINR: number;
}

export interface SmsPreFlightCostSummary {
  totalLeads: number;
  totalSegments: number;
  totalCostUSD: number;
  totalCostINR: number;
  lineItems: SmsPreFlightCostLineItem[];
}

export interface SmsSenderNumberAnalytics {
  senderPoolId: string;
  phoneNumber?: string;
  senderId?: string;
  provider: SmsProviderType;
  allocatedRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  clickedCount: number;
  clickRate: number;
  failedCount: number;
  failRate: number;
  totalSegmentsSent: number;
}

export interface SmsProviderCredentials {
  accountSid?: string;
  authToken?: string;
  messagingServiceSid?: string;
  fromNumber?: string;
  apiKey?: string;
  apiSecret?: string;
  servicePlanId?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  dltEntityId?: string;
  senderId?: string;
  baseUrl?: string;
  authId?: string;
}

export interface InboundSmsPayload {
  fromPhone: string;
  toPhone: string;
  textBody: string;
  provider: SmsProviderType | string;
  providerMsgId?: string;
  headers?: Record<string, any>;
}

export interface ISmsMarketingProvider {
  readonly providerType: SmsProviderType;
  validateCredentials(credentials: SmsProviderCredentials): Promise<boolean>;
  sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[];
  listSenderNumbers?(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]>;
  verifySenderNumber?(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }>;
  parseInboundMessage?(headers: Record<string, any>, payload: any): InboundSmsPayload | null;
}

export interface SmsAudienceEstimationResult {
  totalCount: number;
  validPhoneCount: number;
  duplicateCount: number;
  finalAudienceCount: number;
}

export interface SmsCampaignAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  providerType: SmsProviderType;
  fromSender: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  clickedCount: number;
  clickRate: number;
  failedCount: number;
  failRate: number;
  totalSegmentsSent: number;
  topClickedLinks: Array<{ url: string; clicks: number }>;
  hourlyActivity?: Array<{ hour: string; clicks: number }>;
  senderBreakdown?: SmsSenderNumberAnalytics[];
}

export interface SmsConversationItem {
  id: string;
  contactPhone: string;
  contactName?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  brokerId?: string | null;
  agentUserId?: string | null;
  status: 'open' | 'pending' | 'closed' | string;
  lastMessageText?: string | null;
  lastMessageAt?: string | Date | null;
  unreadCount: number;
  aiAutoReplyDisabled: boolean;
  aiReplyCount: number;
  assignedProvider: string;
  assignedSenderPhone?: string | null;
  assignedSenderId?: string | null;
  campaignId?: string | null;
  recipientId?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  agent?: { id: string; name: string; email: string } | null;
  lead?: { id: string; name: string; phone: string; email?: string; status: string; score?: number } | null;
  customer?: { id: string; name: string; phone: string; email?: string } | null;
  broker?: { id: string; name: string; phone: string; companyName?: string } | null;
  campaign?: { id: string; title: string } | null;
}

export interface SmsMessageItem {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  senderType: 'agent' | 'bot' | 'contact';
  senderName?: string | null;
  fromPhone: string;
  toPhone: string;
  bodyText: string;
  segmentsCount: number;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | string;
  provider?: string | null;
  providerMsgId?: string | null;
  isAiGenerated: boolean;
  sentAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  failedAt?: string | Date | null;
  failureReason?: string | null;
  createdAt: string | Date;
}

export interface SmsQuickReplyItem {
  shortcut: string;
  title: string;
  text: string;
}

export interface SmsFlowEntity {
  id: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived' | string;
  triggerType: 'keyword_match' | 'any_reply' | 'campaign_reply' | string;
  triggerConfig?: { keywords?: string[]; matchMode?: 'contains' | 'exact' } | any;
  isGlobal: boolean;
  campaignIds: string[];
  projectId?: string | null;
  project?: { id: string; name: string } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  nodes?: SmsFlowNodeEntity[];
  runs?: SmsFlowRunEntity[];
  _count?: { nodes: number; runs: number };
}

export interface SmsFlowNodeEntity {
  id: string;
  flowId: string;
  nodeKey: string;
  nodeType:
  | 'start'
  | 'send_sms_reply'
  | 'ai_agent'
  | 'update_lead_status'
  | 'add_tag'
  | 'remove_tag'
  | 'handoff_presales'
  | 'condition'
  | 'wait_delay'
  | 'end'
  | string;
  config: Record<string, any>;
  positionX?: number | null;
  positionY?: number | null;
  createdAt?: string | Date;
}

export interface SmsFlowRunEntity {
  id: string;
  flowId: string;
  recipientId?: string | null;
  campaignId?: string | null;
  leadId?: string | null;
  status: 'active' | 'completed' | 'failed' | string;
  currentNodeKey?: string | null;
  inboundPhone?: string | null;
  inboundBody?: string | null;
  outboundReply?: string | null;
  vars?: Record<string, any> | null;
  startedAt: string | Date;
  endedAt?: string | Date | null;
}

export interface SmsTagEntity {
  id: string;
  name: string;
  color: string;
  createdAt: string | Date;
}

export interface SmsAiConfigEntity {
  id: string;
  provider: string;
  model: string;
  apiKey?: string | null;
  systemPrompt?: string | null;
  isActive: boolean;
  autoReplyEnabled: boolean;
  autoReplyMaxPerLead: number;
  maxCharacters: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}
