import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';
import type {
  AudienceFilterDto,
  AudienceSourceType,
  CampaignSenderPoolConfig,
  CsvLeadRow,
  EmailProviderType,
  MarketingChannel,
} from '@brokeros/types';

export class CreateCampaignDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: EmailProviderType;

  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  selectedTemplateId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @IsOptional()
  @IsString()
  allocationMode?: 'AUTO_EVEN' | 'CUSTOM_PERCENTAGE';

  @IsOptional()
  @IsArray()
  senderPools?: CampaignSenderPoolConfig[];
}

export class SaveDraftCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: EmailProviderType;

  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  selectedTemplateId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @IsOptional()
  @IsString()
  allocationMode?: 'AUTO_EVEN' | 'CUSTOM_PERCENTAGE';

  @IsOptional()
  @IsArray()
  senderPools?: CampaignSenderPoolConfig[];
}

export class PreviewAudienceDto {
  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];
}

export class SendTestEmailDto {
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  toEmail?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsString()
  providerType?: EmailProviderType;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class ConnectIntegrationDto {
  @IsString()
  provider!: EmailProviderType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  awsAccessKeyId?: string;

  @IsOptional()
  @IsString()
  awsSecretKey?: string;

  @IsOptional()
  @IsString()
  awsRegion?: string;

  @IsOptional()
  @IsString()
  mailchimpServer?: string;

  @IsOptional()
  @IsString()
  mailgunDomain?: string;

  @IsOptional()
  @IsString()
  mailgunRegion?: string;

  @IsOptional()
  @IsString()
  oauthClientId?: string;

  @IsOptional()
  @IsString()
  oauthClientSecret?: string;

  @IsOptional()
  @IsString()
  oauthRefreshToken?: string;

  @IsOptional()
  @IsString()
  oauthTenantId?: string;

  @IsOptional()
  @IsString()
  googleAppPassword?: string;

  @IsOptional()
  @IsString()
  constantContactApiKey?: string;

  @IsOptional()
  @IsString()
  constantContactSecret?: string;

  @IsOptional()
  @IsString()
  constantContactRefreshToken?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  category!: string;

  @IsString()
  htmlBody!: string;

  @IsOptional()
  @IsString()
  plainText?: string;

  @IsOptional()
  @IsString()
  previewImageUrl?: string;
}

export class AddSenderDomainDto {
  @IsString()
  fromEmail!: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsNumber()
  dailyQuota?: number;

  @IsOptional()
  @IsBoolean()
  isWarmupMode?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class UpdateSenderDomainDto {
  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsNumber()
  dailyQuota?: number;

  @IsOptional()
  @IsBoolean()
  isWarmupMode?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CalculateCostEstimateDto {
  @IsArray()
  senderPools!: CampaignSenderPoolConfig[];

  @IsNumber()
  totalRecipients!: number;
}

export class BulkAssignLeadsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];
}

export class ExportLeadsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];
}
