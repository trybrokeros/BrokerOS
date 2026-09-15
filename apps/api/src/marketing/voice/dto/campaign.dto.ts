import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoiceAudienceFiltersDto,
  VoiceCsvRecipientDto,
} from './audience.dto.js';

export class CreateVoiceCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  telephonyId?: string;

  @IsOptional()
  @IsString()
  callerIdNumber?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;

  @IsString()
  @IsNotEmpty()
  llmModel!: string;

  @IsString()
  @IsNotEmpty()
  voiceProvider!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsOptional()
  @IsString()
  voiceName?: string;

  @IsString()
  @IsNotEmpty()
  scriptPrompt!: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxConcurrentCalls?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  retryLimit?: number;

  @IsOptional()
  @IsString()
  callingWindowStart?: string;

  @IsOptional()
  @IsString()
  callingWindowEnd?: string;

  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  @ValidateNested()
  @Type(() => VoiceAudienceFiltersDto)
  audienceFilters?: VoiceAudienceFiltersDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoiceCsvRecipientDto)
  csvRecipients?: VoiceCsvRecipientDto[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  scheduledAt?: Date | string;

  @IsOptional()
  studioSettings?: Record<string, any>;
}

export class SaveDraftVoiceCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  telephonyId?: string;

  @IsOptional()
  @IsString()
  callerIdNumber?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;

  @IsOptional()
  @IsString()
  llmModel?: string;

  @IsOptional()
  @IsString()
  voiceProvider?: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  @IsString()
  voiceName?: string;

  @IsOptional()
  @IsString()
  scriptPrompt?: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsInt()
  maxConcurrentCalls?: number;

  @IsOptional()
  @IsInt()
  retryLimit?: number;

  @IsOptional()
  @IsString()
  callingWindowStart?: string;

  @IsOptional()
  @IsString()
  callingWindowEnd?: string;

  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  audienceFilters?: Record<string, any>;

  @IsOptional()
  studioSettings?: Record<string, any>;
}
