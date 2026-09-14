// ============================================================================
// BrokerOS — WhatsApp AI Assistant Controller (REST API)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppAiService } from './whatsapp-ai.service.js';
import { SaveWhatsAppAiConfigDto, DraftReplyDto } from '../dto/whatsapp.dto.js';

@Controller('api/marketing/whatsapp/ai')
export class WhatsAppAiController {
  constructor(private readonly aiService: WhatsAppAiService) {}

  @Get('config')
  async getAiConfig(@Query('accountId') accountId: string) {
    return this.aiService.getAiConfig(accountId);
  }

  @Post('config')
  async saveAiConfig(
    @Query('accountId') accountId: string,
    @Body() dto: SaveWhatsAppAiConfigDto,
  ) {
    return this.aiService.saveAiConfig(accountId, dto);
  }

  @Delete('config')
  @HttpCode(HttpStatus.OK)
  async deleteAiConfig(@Query('accountId') accountId: string) {
    return this.aiService.deleteAiConfig(accountId);
  }

  @Post('draft')
  @HttpCode(HttpStatus.OK)
  async draftReply(
    @Query('accountId') accountId: string,
    @Body() dto: DraftReplyDto,
  ) {
    return this.aiService.draftReply(accountId, dto.conversationId, dto.agentName, dto.instruction);
  }
}

