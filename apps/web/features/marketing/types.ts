import type {
  SenderDomainRecord,
  CampaignSenderPoolConfig,
  CampaignSenderPoolItem,
  PreFlightCostLineItem,
  PreFlightCostSummary,
  SenderDomainAnalytics,
} from '@brokeros/types';

export type {
  SenderDomainRecord,
  CampaignSenderPoolConfig,
  CampaignSenderPoolItem,
  PreFlightCostLineItem,
  PreFlightCostSummary,
  SenderDomainAnalytics,
};

export type EmailProviderType =
  | 'SYSTEM_DEFAULT'
  | 'AWS_SES'
  | 'SENDGRID'
  | 'BREVO'
  | 'MAILCHIMP'
  | 'MAILGUN'
  | 'GMAIL'
  | 'OUTLOOK'
  | 'CONSTANT_CONTACT'
  | 'MULTI_PROVIDER';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'PAUSED' | 'FAILED' | 'CANCELLED';
export type AudienceSourceType = 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

export interface CampaignItem {
  id: string;
  title: string;
  channel: string;
  status: CampaignStatus;
  providerType: EmailProviderType;
  audienceSource: AudienceSourceType;
  subject: string;
  fromName: string;
  fromEmail: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  scheduledAt?: string;
  createdAt: string;
  project?: { id: string; name: string };
  integration?: { id: string; name: string; provider: string };
  createdBy?: { id: string; name: string; email: string };
  allocationMode?: 'AUTO_EVEN' | 'CUSTOM_PERCENTAGE';
  senderPools?: CampaignSenderPoolItem[];
}

export interface CsvLeadRow {
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  budget?: number;
  interestedProject?: string;
  temperature?: 'HOT' | 'WARM' | 'COLD';
  tags?: string[];
}

export interface AudienceEstimation {
  totalCount: number;
  validEmailCount: number;
  duplicateCount: number;
  unsubscribedCount: number;
  finalAudienceCount: number;
}

export interface IntegrationRecord {
  id: string;
  provider: EmailProviderType;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
  senderDomains?: SenderDomainRecord[];
}

export type EmailIntegrationItem = IntegrationRecord;

// ── SMS Types & ViewModels ──

export type SmsProviderType =
  | 'TWILIO'
  | 'AWS_SNS'
  | 'SINCH'
  | 'GUPSHUP'
  | 'INFOBIP'
  | 'VONAGE'
  | 'TELNYX'
  | 'PLIVO'
  | 'BIRD';

export interface SmsCampaignItem {
  id: string;
  title: string;
  channel: string;
  status: CampaignStatus;
  providerType: SmsProviderType;
  audienceSource: AudienceSourceType;
  fromSender: string;
  messageContent: string;
  dltTemplateId?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  failedCount: number;
  totalSegmentsSent: number;
  scheduledAt?: string;
  createdAt: string;
  project?: { id: string; name: string };
  integration?: { id: string; name: string; provider: string };
  createdBy?: { id: string; name: string; email: string };
}

export interface SmsSenderNumberRecord {
  id: string;
  phoneNumber: string;
  dltHeader?: string | null;
  dailyQuota: number;
  sentToday: number;
  isActive: boolean;
  isVerified: boolean;
  provider: string;
  integrationId: string;
  createdAt?: string;
}

export interface SmsIntegrationRecord {
  id: string;
  provider: SmsProviderType;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  fromSender: string;
  awsRegion?: string;
  dltEntityId?: string;
  baseUrl?: string;
  apiSecret?: string;
  authId?: string;
  senderNumbers?: SmsSenderNumberRecord[];
  createdAt: string;
  updatedAt?: string;
}

export interface SmsRecipientItem {
  id: string;
  phone: string;
  name?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'CLICKED' | 'FAILED';
  source: AudienceSourceType;
  segmentsCount: number;
  clickCount: number;
  sentAt?: string;
  firstClickedAt?: string;
  deliveredAt?: string;
  failReason?: string;
  leadId?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    temperature?: string;
    status: string;
  };
  mergeData?: Record<string, unknown>;
}

export interface SmsAnalyticsSummary {
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
  totalSegmentsSent: number;
  topClickedLinks: Array<{ url: string; clicks: number }>;
}

export interface SmsAudienceEstimation {
  totalCount: number;
  validPhoneCount: number;
  duplicateCount: number;
  finalAudienceCount: number;
}

// ── Voice & AI Voice Agent Types & ViewModels ──

export type VoiceTelephonyType = 'TWILIO' | 'VOBIZ' | 'EXOTEL' | 'TELNYX' | 'AMAZON_CONNECT';
export type VoiceAgentPlatform =
  | 'VAPI'
  | 'RETELL'
  | 'ELEVENLABS'
  | 'SARVAM'
  | 'BOLNA'
  | 'PIPECAT'
  | 'LIVEKIT'
  | 'OPENAI_REALTIME';

export type VoiceCallDisposition =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BUSY'
  | 'NO_ANSWER'
  | 'FAILED'
  | 'VOICEMAIL'
  | 'TRANSFERRED';

export interface VoiceTelephonyIntegrationRecord {
  id: string;
  provider: VoiceTelephonyType;
  name: string;
  accountSid?: string;
  fromNumbers: string[];
  subdomain?: string;
  sipDomain?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface VoiceAgentIntegrationRecord {
  id: string;
  platform: VoiceAgentPlatform;
  name: string;
  orgId?: string;
  serverUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface VoiceCampaignItem {
  id: string;
  title: string;
  channel: string;
  status: CampaignStatus;
  isCpCampaign: boolean;
  telephonyId?: string;
  callerIdNumber?: string;
  agentPlatformId?: string;
  llmModel: string;
  voiceProvider: string;
  voiceId: string;
  voiceName: string;
  scriptPrompt: string;
  firstMessage?: string;
  maxConcurrentCalls: number;
  retryLimit: number;
  callingWindowStart?: string;
  callingWindowEnd?: string;
  totalRecipients: number;
  completedCalls: number;
  busyCalls: number;
  noAnswerCalls: number;
  failedCalls: number;
  totalDurationSec: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  project?: { id: string; name: string; city?: string };
  telephony?: { id: string; name: string; provider: VoiceTelephonyType };
  agentIntegration?: { id: string; name: string; platform: VoiceAgentPlatform };
  createdBy?: { id: string; name: string; email?: string; phoneNumber?: string };
  _count?: { recipients: number };
}

export interface VoiceRecipientItem {
  id: string;
  phone: string;
  name?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  disposition?: VoiceCallDisposition;
  callDurationSec: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  failReason?: string;
  leadId?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    temperature?: string;
    status: string;
  };
  mergeData?: Record<string, any>;
  createdAt: string;
}

export interface VoiceCallLogItem {
  id: string;
  recipientId: string;
  phone: string;
  name?: string;
  durationSec: number;
  disposition: VoiceCallDisposition;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  summary?: string;
  recordingUrl?: string;
}

export interface VoiceAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  telephonyType: VoiceTelephonyType;
  agentPlatform: VoiceAgentPlatform;
  callerIdNumber?: string;
  totalRecipients: number;
  completedCalls: number;
  busyCalls: number;
  noAnswerCalls: number;
  failedCalls: number;
  completionRate: number;
  averageDurationSec: number;
  totalDurationSec: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentCallLogs: VoiceCallLogItem[];
}

// ── Email Automation & Flows Types ──

export interface EmailFlowNode {
  id?: string;
  flowId?: string;
  nodeKey: string;
  nodeType:
  | 'start'
  | 'send_email'
  | 'ai_reply'
  | 'ai_agent'
  | 'condition'
  | 'update_lead'
  | 'add_tag'
  | 'pre_sales_handoff'
  | 'human_handoff'
  | 'end';
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

export interface EmailFlow {
  id: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived';
  triggerType: 'keyword_match' | 'any_reply' | 'campaign_reply';
  triggerConfig?: Record<string, any>;
  isGlobal: boolean;
  campaignIds?: string[];
  projectId?: string | null;
  project?: { id: string; name: string };
  nodes?: EmailFlowNode[];
  _count?: { nodes: number; runs: number };
  createdAt: string;
  updatedAt: string;
}

export interface EmailFlowRun {
  id: string;
  flowId: string;
  recipientEmail: string;
  campaignId?: string | null;
  inboundMsgId?: string | null;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  executionLog?: Array<{
    timestamp: string;
    nodeKey: string;
    nodeType: string;
    action: string;
    result: string;
    error?: string;
  }>;
  createdAt: string;
  completedAt?: string | null;
}

export interface EmailQuickReply {
  id: string;
  shortcut: string;
  title: string;
  subject?: string | null;
  contentHtml: string;
  category?: string | null;
  isActive: boolean;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTag {
  id: string;
  name: string;
  color: string;
  _count?: { recipients: number };
  createdAt: string;
  updatedAt: string;
}

export interface EmailAiConfig {
  id: string;
  provider: 'groq' | 'openai';
  model: string;
  apiKey?: string | null;
  systemPrompt: string;
  isActive: boolean;
  autoReplyEnabled: boolean;
  autoReplyMaxPerLead: number;
  updatedAt: string;
}

export interface EmailInboundMessage {
  id: string;
  provider: string;
  fromEmail: string;
  fromName?: string | null;
  toEmail: string;
  subject?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  messageId?: string | null;
  inReplyTo?: string | null;
  recipientId?: string | null;
  campaignId?: string | null;
  processed: boolean;
  flowRunId?: string | null;
  createdAt: string;
}
