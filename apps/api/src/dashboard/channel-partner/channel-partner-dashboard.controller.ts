import { Controller, Get, Req, Query } from '@nestjs/common';
import { ChannelPartnerDashboardService } from './channel-partner-dashboard.service.js';
import { ChannelPartnerAnalyticsService } from './channel-partner-analytics.service.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/dashboard/channel-partner')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'CHANNEL_PARTNER')
export class ChannelPartnerDashboardController {
  constructor(
    private readonly dashboardService: ChannelPartnerDashboardService,
    private readonly analyticsService: ChannelPartnerAnalyticsService,
  ) {}

  @Get()
  getDashboard(@Req() req: any, @Query('period') period?: string) {
    return this.dashboardService.getDashboard(req.user?.id, period);
  }

  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('range') range?: string) {
    return this.analyticsService.getAnalytics(req.user?.id, range);
  }
}
