// ============================================================================
// BrokerOS — Email Marketing Types & Interfaces
// ============================================================================

import type { AudienceSourceType, CampaignStatus } from './common.js';

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

export interface EmailRecipient {
  email: string;
  name?: string;
  phone?: string;
  leadId?: string;
  brokerId?: string;
  source?: AudienceSourceType;
  mergeData?: Record<string, string | number | boolean | undefined>;
}

export interface SendEmailOptions {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  tracking?: {
    campaignId: string;
    enableOpens?: boolean;
    enableClicks?: boolean;
  };
  attachments?: Array<{
    filename: string;
    content: string; // Base64 or string
    contentType: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  provider: EmailProviderType;
  providerMessageId?: string;
  sentCount: number;
  failedRecipients?: Array<{ email: string; reason: string }>;
  error?: string;
}

export interface EmailWebhookEvent {
  providerMessageId: string;
  campaignId?: string;
  recipientEmail: string;
  eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'SPAM_COMPLAINT' | 'UNSUBSCRIBED';
  timestamp: Date;
  metadata?: {
    linkUrl?: string;
    bounceReason?: string;
    ip?: string;
    userAgent?: string;
  };
}

export interface DiscoveredSenderIdentity {
  fromEmail: string;
  fromName: string;
  domain: string;
  isVerified: boolean;
  providerId?: string;
}

export interface SenderDomainRecord {
  id: string;
  integrationId: string;
  fromEmail: string;
  fromName: string;
  domain: string;
  replyTo?: string | null;
  dailyQuota: number;
  sentToday: number;
  isWarmupMode: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  integration?: {
    id: string;
    name: string;
    provider: EmailProviderType;
  };
}

export interface CampaignSenderPoolConfig {
  senderDomainId?: string;
  integrationId?: string;
  allocationPercentage: number;
  allocatedLeads?: number;
  weight?: number;
  fromName?: string;
  fromEmail?: string;
  domain?: string;
  provider?: EmailProviderType;
}

export interface CampaignSenderPoolItem {
  id: string;
  campaignId: string;
  senderDomainId: string;
  weight: number;
  allocatedRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: string;
  senderDomain?: SenderDomainRecord;
}

export interface PreFlightCostLineItem {
  provider: EmailProviderType;
  providerName: string;
  domain: string;
  fromEmail: string;
  allocatedLeads: number;
  percentage: number;
  costPer1kUSD: number;
  costUSD: number;
  costINR: number;
}

export interface PreFlightCostSummary {
  totalLeads: number;
  totalCostUSD: number;
  totalCostINR: number;
  lineItems: PreFlightCostLineItem[];
}

export interface SenderDomainAnalytics {
  senderPoolId: string;
  domain: string;
  fromEmail: string;
  fromName: string;
  provider: EmailProviderType;
  allocatedRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  openedCount: number;
  openRate: number;
  clickedCount: number;
  clickRate: number;
  bouncedCount: number;
  bounceRate: number;
}

export interface ProviderCredentials {
  apiKey?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  mailchimpServer?: string;
  mailgunDomain?: string;
  mailgunRegion?: 'US' | 'EU';
  googleClientId?: string;
  googleClientSecret?: string;
  googleRefreshToken?: string;
  googleAppPassword?: string;
  microsoftTenantId?: string;
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  microsoftRefreshToken?: string;
  constantContactApiKey?: string;
  constantContactSecret?: string;
  constantContactRefreshToken?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthRefreshToken?: string;
  oauthTenantId?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

export interface IEmailMarketingProvider {
  readonly providerType: EmailProviderType;
  validateCredentials(credentials: ProviderCredentials): Promise<boolean>;
  sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult>;
  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[];
  listVerifiedSenders?(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]>;
  verifySenderIdentity?(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }>;
}

export interface CampaignAnalyticsSummary {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  providerType: EmailProviderType;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: number;
  openedCount: number;
  openRate: number;
  clickedCount: number;
  clickRate: number;
  clickToOpenRate: number;
  bouncedCount: number;
  bounceRate: number;
  unsubscribedCount: number;
  complaintCount: number;
  topClickedLinks: Array<{ url: string; clicks: number }>;
  hourlyActivity: Array<{ hour: string; opens: number; clicks: number }>;
  domainBreakdown?: SenderDomainAnalytics[];
}
