// ============================================================================
// BrokerOS — WhatsApp AI Assistant Configuration DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SaveWhatsAppAiConfigDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  autoReplyEnabled?: boolean;

  @IsOptional()
  autoReplyMaxPerConversation?: number;

  @IsString()
  @IsOptional()
  handoffAgentId?: string;
}

export class DraftReplyDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @IsOptional()
  agentName?: string;

  @IsString()
  @IsOptional()
  instruction?: string;
}

