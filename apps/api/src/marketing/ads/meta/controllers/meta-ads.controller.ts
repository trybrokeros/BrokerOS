import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { MetaAdsService } from '../services/meta-ads.service.js';
import {
  ConnectMetaIntegrationDto,
  TestMetaTokenDto,
  SyncMetaCampaignsDto,
  BulkAssignMetaLeadsDto,
} from '../dto/meta-ads.dto.js';
import { Roles } from '../../../../auth/roles.decorator.js';

@Controller('api/marketing/ads/meta')
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Get('integrations')
  async listIntegrations() {
    return this.metaAdsService.listIntegrations();
  }

  @Post('integrations')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async connectIntegration(@Body() dto: ConnectMetaIntegrationDto) {
    return this.metaAdsService.connectIntegration(dto);
  }

  @Delete('integrations/:id')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async deleteIntegration(@Param('id') id: string) {
    return this.metaAdsService.deleteIntegration(id);
  }

  @Post('integrations/:id/sync')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async syncIntegration(
    @Param('id') id: string,
    @Body() dto: SyncMetaCampaignsDto,
  ) {
    return this.metaAdsService.triggerSync(id, dto?.datePreset);
  }

  @Post('test-connection')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING')
  async testConnection(@Body() dto: TestMetaTokenDto) {
    return this.metaAdsService.testConnection(dto);
  }

  @Get('campaigns')
  async getCampaigns(@Query('integrationId') integrationId?: string) {
    return this.metaAdsService.getCampaigns(integrationId);
  }

  @Get('campaigns/:id')
  async getCampaignDetails(@Param('id') id: string) {
    return this.metaAdsService.getCampaignDetails(id);
  }

  @Post('leads/bulk-assign')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING', 'PRE_SALES_MANAGER', 'SALES_MANAGER')
  async bulkAssignLeads(@Body() dto: BulkAssignMetaLeadsDto) {
    return this.metaAdsService.bulkAssignLeadsToPreSales(dto);
  }

  @Post('campaigns/:id/leads/bulk-assign')
  @Roles('ADMIN', 'DIRECTOR', 'MARKETING', 'PRE_SALES_MANAGER', 'SALES_MANAGER')
  async bulkAssignCampaignLeads(
    @Param('id') id: string,
    @Body() dto: BulkAssignMetaLeadsDto,
  ) {
    return this.metaAdsService.bulkAssignLeadsToPreSales({
      ...dto,
      campaignId: id,
    });
  }
}
