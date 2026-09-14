// ============================================================================
// BrokerOS — Email Inbox Controller (REST API for 2-Way Email Team Inbox)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { EmailInboxService } from '../services/email-inbox.service.js';
import {
  ListEmailConversationsQueryDto,
  StartEmailConversationDto,
  SendEmailReplyDto,
  UpdateEmailConversationStatusDto,
  AssignEmailConversationAgentDto,
  ListEmailMessagesQueryDto,
  DraftEmailAiReplyDto,
} from '../dto/email-inbox.dto.js';

@Controller('api/marketing/email/inbox')
export class EmailInboxController {
  constructor(private readonly inboxService: EmailInboxService) {}

  @Get('conversations')
  async listConversations(@Query() query: ListEmailConversationsQueryDto) {
    return this.inboxService.listConversations(query);
  }

  @Post('conversations')
  async startConversation(
    @Body() dto: StartEmailConversationDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name, email: req.user.email }
      : undefined;
    return this.inboxService.startConversation(dto, sender);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.inboxService.getConversation(id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query() query: ListEmailMessagesQueryDto,
  ) {
    return this.inboxService.getMessages(id, query);
  }

  @Post('conversations/:id/messages')
  async sendReply(
    @Param('id') id: string,
    @Body() dto: SendEmailReplyDto,
    @Req() req: any,
  ) {
    const sender = req?.user
      ? { id: req.user.id, name: req.user.name, email: req.user.email }
      : undefined;
    return this.inboxService.sendReply(id, dto, sender);
  }

  @Patch('conversations/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEmailConversationStatusDto,
  ) {
    return this.inboxService.updateStatus(id, dto.status);
  }

  @Patch('conversations/:id/assign')
  async assignAgent(
    @Param('id') id: string,
    @Body() dto: AssignEmailConversationAgentDto,
    @Req() req: any,
  ) {
    const agentId =
      dto.agentUserId !== undefined ? dto.agentUserId : req?.user?.id;
    return this.inboxService.assignAgent(id, agentId);
  }

  @Post('conversations/:id/read')
  async markRead(@Param('id') id: string) {
    return this.inboxService.markRead(id);
  }

  @Post('conversations/:id/ai-draft')
  async draftAiReply(
    @Param('id') id: string,
    @Body() dto?: DraftEmailAiReplyDto,
  ) {
    return this.inboxService.draftAiReply(id, dto);
  }
}
