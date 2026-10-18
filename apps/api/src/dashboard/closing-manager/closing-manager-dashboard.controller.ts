import { Controller, Get, Req, Query } from '@nestjs/common';
import { ClosingManagerDashboardService } from './closing-manager-dashboard.service.js';
import { ClosingManagerAnalyticsService } from './closing-manager-analytics.service.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/dashboard/closing-manager')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'CLOSING_MANAGER')
export class ClosingManagerDashboardController {
  constructor(
    private readonly closingManagerDashboardService: ClosingManagerDashboardService,
    private readonly closingManagerAnalyticsService: ClosingManagerAnalyticsService,
  ) { }

  @Get()
  async getDashboard(@Req() req: any) {
    const userId = req.user?.id;
    return await this.closingManagerDashboardService.getDashboard(userId);
  }
  @Get('/analytics')
  async getAnalytics(@Req() req: any, @Query('range') range: string) {
    const userId = req.user?.id;
    return await this.closingManagerAnalyticsService.getAnalytics(
      userId,
      range || 'all-time',
    );
  }
}
