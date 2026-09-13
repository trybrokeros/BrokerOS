import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { VoiceService } from '../voice.service.js';
import {
  CreateVoiceCampaignDto,
  SaveDraftVoiceCampaignDto,
  PreviewVoiceAudienceDto,
  CalculateVoiceCostEstimateDto,
  BulkAssignVoiceLeadsDto,
  ExportVoiceLeadsDto,
} from '../dto/voice.dto.js';

@Controller('api/marketing/voice/campaigns')
export class VoiceCampaignsController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('projects')
  getProjects() {
    return this.voiceService.getProjects();
  }

  @Get()
  getCampaigns(
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('isCpCampaign') isCpCampaign?: string,
    @Query('search') search?: string,
    @Query('includeDrafts') includeDrafts?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.voiceService.getCampaigns({
      status,
      projectId,
      isCpCampaign:
        isCpCampaign !== undefined ? isCpCampaign === 'true' : undefined,
      search,
      includeDrafts:
        includeDrafts !== undefined ? includeDrafts === 'true' : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('metrics')
  getOverallMetrics() {
    return this.voiceService.analyticsService.getOverallMetrics();
  }

  @Post('estimate-audience')
  estimateAudience(@Body() dto: PreviewVoiceAudienceDto) {
    return this.voiceService.audienceService.estimateAudience(dto);
  }

  @Post('audience-preview')
  audiencePreview(@Body() dto: PreviewVoiceAudienceDto) {
    return this.voiceService.audienceService.estimateAudience(dto);
  }

  @Post('cost-estimate')
  calculateCostEstimate(@Body() dto: CalculateVoiceCostEstimateDto) {
    return this.voiceService.campaignService.calculateCostEstimate(dto);
  }

  @Post('bulk-assign')
  bulkAssignLeads(@Body() dto: BulkAssignVoiceLeadsDto, @Req() req?: any) {
    const userId = req?.user?.id;
    return this.voiceService.audienceService.bulkAssignRecipientsToCrm(
      dto,
      userId,
    );
  }

  @Post('export')
  exportLeads(@Body() dto: ExportVoiceLeadsDto) {
    return this.voiceService.audienceService.getExportLeadsData(dto);
  }

  @Post('draft')
  saveDraft(
    @Body() dto: SaveDraftVoiceCampaignDto,
    @Query('id') existingId?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.voiceService.saveDraftCampaign(dto, userId, existingId);
  }

  @Post()
  createCampaign(@Body() dto: CreateVoiceCampaignDto, @Req() req?: any) {
    const userId = req?.user?.id;
    return this.voiceService.createCampaign(dto, userId);
  }

  @Get(':id')
  getCampaignById(@Param('id') id: string) {
    return this.voiceService.getCampaignById(id);
  }

  @Get(':id/analytics')
  getCampaignAnalytics(@Param('id') id: string) {
    return this.voiceService.analyticsService.getCampaignAnalytics(id);
  }

  @Get(':id/recipients')
  getRecipients(
    @Param('id') id: string,
    @Query()
    query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.voiceService.analyticsService.getCampaignRecipients(id, query);
  }

  @Delete(':id')
  deleteCampaign(@Param('id') id: string) {
    return this.voiceService.deleteCampaign(id);
  }

  @Post(':id/dispatch')
  dispatchCampaign(@Param('id') id: string) {
    return this.voiceService.dispatchCampaign(id);
  }

  @Post('recipients/:id/promote')
  promoteRecipient(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id;
    return this.voiceService.audienceService.promoteCsvRecipientToLead(
      id,
      userId,
    );
  }
}
