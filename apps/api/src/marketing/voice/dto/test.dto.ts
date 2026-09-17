import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class TestTelephonyCarrierDto {
  @IsString()
  @IsNotEmpty()
  telephonyId!: string;

  @IsString()
  @IsNotEmpty()
  toPhone!: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;
}

export class TestVoiceAiCallDto {
  @IsString()
  @IsNotEmpty()
  toPhone!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  assistantId?: string;

  @IsOptional()
  @IsString()
  testMode?: string;

  @IsOptional()
  @IsString()
  telephonyId?: string;

  @IsString()
  @IsNotEmpty()
  agentPlatformId!: string;

  @IsString()
  @IsNotEmpty()
  llmModel!: string;

  @IsString()
  @IsNotEmpty()
  voiceProvider!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsString()
  @IsNotEmpty()
  scriptPrompt!: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;

  @IsOptional()
  @IsString()
  transcriberModel?: string;

  @IsOptional()
  @IsString()
  transcriberLanguage?: string;

  @IsOptional()
  @IsNumber()
  maxTurnSilenceMs?: number;

  @IsOptional()
  @IsNumber()
  voiceSpeed?: number;

  @IsOptional()
  @IsString()
  firstMessageMode?: string;

  @IsOptional()
  @IsString()
  voicemailDetection?: string;

  @IsOptional()
  @IsString()
  backgroundSound?: string;

  @IsOptional()
  @IsNumber()
  maxDurationSeconds?: number;

  @IsOptional()
  @IsString()
  retellVoiceModel?: string;

  @IsOptional()
  @IsString()
  retellEmotion?: string;

  @IsOptional()
  @IsBoolean()
  enableExpressiveMode?: boolean;

  @IsOptional()
  @IsString()
  retellAmbientSound?: string;

  @IsOptional()
  @IsString()
  retellLanguage?: string;

  @IsOptional()
  @IsBoolean()
  retellBackchannel?: boolean;

  @IsOptional()
  @IsNumber()
  retellReminderMs?: number;
}
