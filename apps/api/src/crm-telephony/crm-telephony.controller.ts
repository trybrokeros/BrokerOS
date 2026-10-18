import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CrmTelephonyService } from './crm-telephony.service.js';
import {
  ConnectCrmTelephonyDto,
  InitiateCrmCallDto,
  HangupCrmCallDto,
  VerifyCrmTelephonyDto,
} from './dto/crm-telephony.dto.js';

import { Roles } from '../auth/roles.decorator.js';

@Controller(['api/crm/telephony', 'telephony'])
export class CrmTelephonyController {
  constructor(private readonly telephonyService: CrmTelephonyService) { }

  /**
   * Returns active CRM telephony configuration for Admin Settings & softphone status.
   */
  @Get('config')
  async getConfig() {
    return this.telephonyService.getActiveConfig();
  }

  /**
   * Connects / updates the single active company-wide telephony carrier.
   */
  @Post('connect')
  @Roles('ADMIN', 'DIRECTOR')
  async connect(@Body() dto: ConnectCrmTelephonyDto) {
    return this.telephonyService.connectProvider(dto);
  }

  /**
   * Disconnects the active telephony provider.
   */
  @Delete('disconnect/:id')
  @Roles('ADMIN', 'DIRECTOR')
  async disconnect(@Param('id') id: string) {
    return this.telephonyService.disconnectProvider(id);
  }

  /**
   * Triggers an outbound carrier verification call to admin's phone.
   */
  @Post('verify')
  @Roles('ADMIN', 'DIRECTOR')
  async verify(@Body() dto: VerifyCrmTelephonyDto) {
    return this.telephonyService.verifyProvider(dto);
  }

  /**
   * Mints an ephemeral WebRTC access token for the logged-in agent.
   */
  @Post('token')
  async getToken(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required to mint WebRTC token.');
    }
    return this.telephonyService.generateAgentToken(userId);
  }

  /**
   * Initiates an outbound in-browser softphone call to a lead.
   */
  @Post('call')
  async call(@Body() dto: InitiateCrmCallDto, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required to place calls.');
    }
    return this.telephonyService.initiateCall(userId, dto);
  }

  /**
   * Hangs up an active call session.
   */
  @Post('hangup')
  async hangup(@Body() dto: HangupCrmCallDto, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.telephonyService.hangupCall(userId, dto.callRecordId);
  }
}
