// ============================================================================
// BrokerOS — WhatsApp Account Configuration Controller
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WhatsAppConfigService } from './whatsapp-config.service.js';
import {
  ConnectWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
} from '../dto/whatsapp.dto.js';
import { Roles } from '../../../auth/roles.decorator.js';

@Controller('api/marketing/whatsapp/config')
@Roles('ADMIN', 'DIRECTOR', 'MARKETING', 'BUSINESS_MANAGER')
export class WhatsAppConfigController {
  constructor(private readonly configService: WhatsAppConfigService) {}

  @Get()
  async getCurrentConfig() {
    return this.configService.getConfig();
  }

  @Get('all')
  async listAccounts() {
    return this.configService.listAccounts();
  }

  @Post()
  @Post('connect')
  async connectAccount(@Body() dto: ConnectWhatsAppAccountDto) {
    return this.configService.connectAccount(dto);
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') id: string,
    @Body() dto: UpdateWhatsAppAccountDto,
  ) {
    return this.configService.updateAccount(id, dto);
  }

  @Delete(':id')
  async disconnectAccount(@Param('id') id: string) {
    return this.configService.disconnectAccount(id);
  }
}
