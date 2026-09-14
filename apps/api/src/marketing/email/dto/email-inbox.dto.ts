// ============================================================================
// BrokerOS — Email Inbox DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ListEmailConversationsQueryDto {
  @IsString()
  @IsOptional()
  status?: string; // 'all' | 'open' | 'pending' | 'closed'

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}

export class UpdateEmailConversationStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'open' | 'pending' | 'closed';
}

export class AssignEmailConversationAgentDto {
  @IsString()
  @IsOptional()
  agentUserId?: string | null;
}

export class StartEmailConversationDto {
  @IsString()
  @IsNotEmpty()
  contactEmail!: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsOptional()
  initialMessage?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  assignedProvider?: string;

  @IsString()
  @IsOptional()
  assignedSenderEmail?: string;
}

export class SendEmailReplyDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    contentType?: string;
  }>;

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class ListEmailMessagesQueryDto {
  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}

export class DraftEmailAiReplyDto {
  @IsString()
  @IsOptional()
  leadName?: string;

  @IsString()
  @IsOptional()
  agentName?: string;

  @IsString()
  @IsOptional()
  instruction?: string;
}

