import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SmsService } from '../sms.service.js';
import {
  ConnectSmsIntegrationDto,
  AddSenderNumberDto,
  UpdateSenderNumberDto,
} from '../dto/sms.dto.js';
import { Roles } from '../../../auth/roles.decorator.js';

@Controller('api/marketing/sms/integrations')
@Roles('ADMIN', 'DIRECTOR', 'MARKETING', 'BUSINESS_MANAGER')
export class SmsIntegrationsController {
  constructor(private readonly smsService: SmsService) {}

  @Get()
  async list() {
    return this.smsService.listIntegrations();
  }

  @Post()
  async connect(@Body() dto: ConnectSmsIntegrationDto) {
    return this.smsService.connectIntegration(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.smsService.deleteIntegration(id);
  }

  @Patch(':id/default')
  async setDefault(@Param('id') id: string) {
    return this.smsService.setDefaultIntegration(id);
  }

  @Get('numbers')
  async listNumbers() {
    return this.smsService.listAllActiveSenderNumbers();
  }

  @Post(':id/sync-numbers')
  async syncNumbers(@Param('id') id: string) {
    return this.smsService.syncNumbersForIntegration(id);
  }

  @Post(':id/numbers')
  async addNumber(@Param('id') id: string, @Body() dto: AddSenderNumberDto) {
    return this.smsService.addSenderNumber(id, dto);
  }

  @Patch('numbers/:numberId')
  async updateNumber(
    @Param('numberId') numberId: string,
    @Body() dto: UpdateSenderNumberDto,
  ) {
    return this.smsService.updateSenderNumber(numberId, dto);
  }

  @Delete('numbers/:numberId')
  async deleteNumber(@Param('numberId') numberId: string) {
    return this.smsService.deleteSenderNumber(numberId);
  }
}
