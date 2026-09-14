// ============================================================================
// BrokerOS — SMS Inbox DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ListSmsConversationsQueryDto {
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

export class UpdateSmsConversationStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'open' | 'pending' | 'closed';
}

export class AssignSmsConversationAgentDto {
  @IsString()
  @IsOptional()
  agentUserId?: string | null;
}

export class StartSmsConversationDto {
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsNotEmpty()
  initialMessage!: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  assignedProvider?: string;

  @IsString()
  @IsOptional()
  assignedSenderPhone?: string;

  @IsString()
  @IsOptional()
  assignedSenderId?: string;
}

export class SendSmsReplyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;
}

export class ListSmsMessagesQueryDto {
  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}

export class DraftSmsAiReplyDto {
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

