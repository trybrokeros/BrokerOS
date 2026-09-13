import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class VoiceAudienceFiltersDto {
  @IsOptional()
  @IsArray()
  statuses?: string[];

  @IsOptional()
  @IsArray()
  temperatures?: string[];

  @IsOptional()
  @IsArray()
  projectIds?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsInt()
  minBudget?: number;

  @IsOptional()
  @IsInt()
  maxBudget?: number;
}

export class VoiceCsvRecipientDto {
  @IsOptional()
  phone?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  budget?: number;

  @IsOptional()
  interestedProject?: string;

  @IsOptional()
  temperature?: string;

  @IsOptional()
  mergeData?: Record<string, any>;
}

export class PreviewVoiceAudienceDto {
  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  audienceFilters?: any;

  @IsOptional()
  @IsArray()
  csvRecipients?: any[];
}

export class BulkAssignVoiceLeadsDto {
  @IsArray()
  @IsOptional()
  recipientIds?: string[];

  @IsString()
  @IsNotEmpty()
  campaignId!: string;

  @IsString()
  @IsOptional()
  sentimentFilter?: 'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

  @IsString()
  @IsOptional()
  customTemperature?: 'HOT' | 'WARM' | 'COLD';

  @IsString()
  @IsOptional()
  assignToUserId?: string | null;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  subStatus?: string;
}

export class ExportVoiceLeadsDto {
  @IsString()
  @IsNotEmpty()
  campaignId!: string;

  @IsArray()
  @IsOptional()
  recipientIds?: string[];

  @IsString()
  @IsOptional()
  sentimentFilter?: 'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export class CalculateVoiceCostEstimateDto {
  @IsString()
  @IsOptional()
  telephonyCarrier?: string;

  @IsString()
  @IsOptional()
  agentPlatform?: string;

  @IsInt()
  @Min(1)
  recipientCount!: number;

  @IsInt()
  @IsOptional()
  expectedDurationSeconds?: number;
}

