import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { VoiceIntegrationsService } from '../services/voice-integrations.service.js';
import {
  ConnectVoiceTelephonyDto,
  ConnectVoiceAgentDto,
} from '../dto/voice.dto.js';

@Controller('api/marketing/voice/integrations')
export class VoiceIntegrationsController {
  constructor(private readonly integrationsService: VoiceIntegrationsService) {}

  @Get()
  async getAllIntegrations() {
    const [telephony, agents] = await Promise.all([
      this.integrationsService.getTelephonyIntegrations(),
      this.integrationsService.getAgentIntegrations(),
    ]);
    return { telephony, agents };
  }

  // ── Telephony ──

  @Get('telephony')
  getTelephonyIntegrations() {
    return this.integrationsService.getTelephonyIntegrations();
  }

  @Post('telephony')
  connectTelephony(@Body() dto: ConnectVoiceTelephonyDto) {
    return this.integrationsService.connectTelephony(dto);
  }

  @Delete('telephony/:id')
  deleteTelephony(@Param('id') id: string) {
    return this.integrationsService.deleteTelephony(id);
  }

  @Post('telephony/:id/verify')
  verifyTelephony(@Param('id') id: string) {
    return this.integrationsService.verifyTelephony(id);
  }

  // ── AI Voice Agents ──

  @Get('agents')
  getAgentIntegrations() {
    return this.integrationsService.getAgentIntegrations();
  }

  @Post('agents')
  connectAgent(@Body() dto: ConnectVoiceAgentDto) {
    return this.integrationsService.connectAgent(dto);
  }

  @Delete('agents/:id')
  deleteAgent(@Param('id') id: string) {
    return this.integrationsService.deleteAgent(id);
  }

  @Post('agents/:id/verify')
  verifyAgent(@Param('id') id: string) {
    return this.integrationsService.verifyAgent(id);
  }

  // ── Dynamic Platform Catalog (Models & Voices) ──

  @Get('catalog/:platform')
  getPlatformCatalog(@Param('platform') platform: string) {
    return this.integrationsService.getPlatformCatalog(platform);
  }

  @Get('agents/:id/catalog')
  async getAgentIntegrationCatalog(@Param('id') id: string) {
    const integration =
      await this.integrationsService.prisma.voiceAgentIntegration.findUnique({
        where: { id },
      });
    if (!integration) {
      return { platform: 'VAPI', models: [], voices: [] };
    }
    return this.integrationsService.getPlatformCatalog(
      integration.platform,
      id,
    );
  }
}
