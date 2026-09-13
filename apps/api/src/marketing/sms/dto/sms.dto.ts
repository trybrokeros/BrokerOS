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
  CampaignSmsSenderPoolConfig,
  CsvLeadRow,
  MarketingChannel,
  SmsProviderType,
} from '@brokeros/types';

export class CreateSmsCampaignDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: SmsProviderType;

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
  fromSender?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;

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
  senderPools?: CampaignSmsSenderPoolConfig[];
}

export class SaveDraftSmsCampaignDto {
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
  providerType?: SmsProviderType;

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
  fromSender?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;

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
  senderPools?: CampaignSmsSenderPoolConfig[];
}

export class PreviewSmsAudienceDto {
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

export class SendTestSmsDto {
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  toPhone?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  providerType?: SmsProviderType;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;
}

export class ConnectSmsIntegrationDto {
  @IsString()
  provider!: SmsProviderType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  accountSid?: string;

  @IsOptional()
  @IsString()
  authToken?: string;

  @IsOptional()
  @IsString()
  messagingServiceSid?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  servicePlanId?: string;

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
  dltEntityId?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  authId?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;
}

export class CreateSmsTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsString()
  textContent!: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;
}

export class AddSenderNumberDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsNumber()
  dailyQuota?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSenderNumberDto {
  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsNumber()
  dailyQuota?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CalculateSmsCostEstimateDto {
  @IsArray()
  senderPools!: CampaignSmsSenderPoolConfig[];

  @IsNumber()
  totalRecipients!: number;

  @IsOptional()
  @IsString()
  messageContent?: string;
}

export class BulkAssignSmsLeadsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];
}

export class ExportSmsLeadsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];
}
