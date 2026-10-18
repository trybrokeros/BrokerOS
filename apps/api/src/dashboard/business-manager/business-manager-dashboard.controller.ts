import { Controller, Get, Query, Req } from '@nestjs/common';
import { BusinessManagerDashboardService } from './business-manager-dashboard.service.js';
import { BusinessManagerAnalyticsService } from './business-manager-analytics.service.js';
import { BusinessManagerInventoryService } from './business-manager-inventory.service.js';
import { BusinessManagerFinancialsService } from './business-manager-financials.service.js';
import { BusinessManagerEmployeesService } from './business-manager-employees.service.js';
import { BusinessManagerLeadsService } from './business-manager-leads.service.js';

/**
 * Business Manager Dashboard Controller
 *
 * Routes:
 *   GET /api/dashboard/business-manager          — Main KPI dashboard (combined brokerage + CP)
 *   GET /api/dashboard/business-manager/overview — Same as above, alias
 *   GET /api/dashboard/business-manager/analytics — Analytics charts data
 *   GET /api/dashboard/business-manager/inventory — Inventory and project data
 *   GET /api/dashboard/business-manager/financials — Financial P&L data
 *   GET /api/dashboard/business-manager/employees — Cross-department employee performance
 *   GET /api/dashboard/business-manager/leads — Cross-business lead intelligence
 *
 * Query params:
 *   ?period=weekly|monthly|yearly   — date filter (default: all time)
 */
import { Roles } from '../../auth/roles.decorator.js';

@Controller('api/dashboard/business-manager')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER')
export class BusinessManagerDashboardController {
  constructor(
    private readonly businessManagerService: BusinessManagerDashboardService,
    private readonly businessManagerAnalyticsService: BusinessManagerAnalyticsService,
    private readonly businessManagerInventoryService: BusinessManagerInventoryService,
    private readonly businessManagerFinancialsService: BusinessManagerFinancialsService,
    private readonly businessManagerEmployeesService: BusinessManagerEmployeesService,
    private readonly businessManagerLeadsService: BusinessManagerLeadsService,
  ) {}

  /**
   * Main dashboard: combined KPIs, leaderboards, action items,
   * revenue split between brokerage and CP.
   */
  @Get()
  getDashboard(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerService.getDashboard(period);
  }

  /**
   * Alias route for the frontend's /overview sub-page
   */
  @Get('overview')
  getOverview(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerService.getDashboard(period);
  }

  /**
   * Deep-dive analytics: Funnels, Conversion Rates, Revenue Trend, etc.
   */
  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerAnalyticsService.getAnalytics(period);
  }

  /**
   * Inventory & Projects Data
   */
  @Get('inventory')
  getInventory(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerInventoryService.getInventory(period);
  }

  /**
   * Financial Health & P&L
   */
  @Get('financials')
  getFinancials(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerFinancialsService.getFinancials(period);
  }

  /**
   * Employee Performance & Targets
   */
  @Get('employees')
  getEmployees(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerEmployeesService.getEmployees(period);
  }

  /**
   * Lead Management Intelligence
   */
  @Get('leads')
  getLeads(@Req() req: any, @Query('period') period?: string) {
    return this.businessManagerLeadsService.getLeadsOverview(period);
  }
}
