import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoogleAdsService } from '../services/google-ads.service.js';
import {
  GoogleOAuthUrlQueryDto,
  GoogleOAuthCallbackDto,
  ConnectGoogleIntegrationDto,
  TestGoogleTokenDto,
  SyncGoogleCampaignsDto,
} from '../dto/google-ads.dto.js';
import { Roles } from '../../../../auth/roles.decorator.js';

@Controller('api/marketing/ads/google')
export class GoogleAdsController {
  constructor(private readonly googleAdsService: GoogleAdsService) {}

  /**
   * Returns official Google OAuth 2.0 authorization URL.
   */
  @Get('oauth/url')
  getOAuthUrl(@Query() query: GoogleOAuthUrlQueryDto) {
    const url = this.googleAdsService.getOAuthUrl(
      query.redirectUri,
      query.state,
    );
    return { url };
  }

  /**
   * Handles Google OAuth callback, code exchange, and auto-discovers customer accounts.
   */
  @Post('oauth/callback')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  @HttpCode(HttpStatus.OK)
  async handleOAuthCallback(@Body() dto: GoogleOAuthCallbackDto) {
    return this.googleAdsService.handleOAuthCallback(dto);
  }

  /**
   * Tests credential verification before saving.
   */
  @Post('test-connection')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() dto: TestGoogleTokenDto) {
    return this.googleAdsService.testConnection(dto);
  }

  /**
   * Lists all connected Google Ads accounts.
   */
  @Get('integrations')
  async listIntegrations() {
    return this.googleAdsService.listIntegrations();
  }

  /**
   * Connects a new Google Ads account integration.
   */
  @Post('integrations')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async connectIntegration(@Body() dto: ConnectGoogleIntegrationDto) {
    return this.googleAdsService.connectIntegration(dto);
  }

  /**
   * Disconnects a Google Ads account.
   */
  @Delete('integrations/:id')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async deleteIntegration(@Param('id') id: string) {
    return this.googleAdsService.deleteIntegration(id);
  }

  /**
   * Triggers an on-demand live GAQL sync.
   */
  @Post('integrations/:id/sync')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  @HttpCode(HttpStatus.OK)
  async syncIntegration(
    @Param('id') id: string,
    @Body() dto: SyncGoogleCampaignsDto,
  ) {
    return this.googleAdsService.triggerSync(id, dto?.datePreset);
  }

  /**
   * Returns cached campaigns with aggregate KPIs.
   */
  @Get('campaigns')
  async getCampaigns(@Query('integrationId') integrationId?: string) {
    return this.googleAdsService.getCampaigns(integrationId);
  }

  /**
   * Returns campaign inspection with search keywords, quality scores, and acquired leads.
   */
  @Get('campaigns/:id')
  async getCampaignDetails(@Param('id') id: string) {
    return this.googleAdsService.getCampaignDetails(id);
  }
}
