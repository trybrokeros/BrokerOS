import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { PreSalesDashboardService } from '../pre-sales/pre-sales-dashboard.service.js';
import { PreSalesAnalyticsService } from '../pre-sales/pre-sales-analytics.service.js';
import { SalesManagerDashboardService } from '../sales-manager/sales-manager-dashboard.service.js';
import { SalesManagerAnalyticsService } from '../sales-manager/sales-manager-analytics.service.js';
import { SalesExecDashboardService } from '../sales-exec/sales-exec-dashboard.service.js';
import { SalesExecAnalyticsService } from '../sales-exec/sales-exec-analytics.service.js';
import { PostSalesDashboardService } from '../post-sales/post-sales-dashboard.service.js';
import { PostSalesAnalyticsService } from '../post-sales/post-sales-analytics.service.js';
import { SourcingManagerDashboardService } from '../sourcing-manager/sourcing-manager-dashboard.service.js';
import { ClosingManagerDashboardService } from '../closing-manager/closing-manager-dashboard.service.js';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/dashboard.dto.js';
import { Roles } from '../../auth/roles.decorator.js';

// ─── Pre-Sales Agent Dashboard ────────────────────────────────────────────────

@Controller('api/dashboard/pre-sales')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'PRE_SALES_MANAGER', 'PRE_SALES')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly employeesService: EmployeesService,
    private readonly preSalesAnalytics: PreSalesAnalyticsService,
  ) {}

  /** Main dashboard data */
  @Get()
  getDashboard(@Req() req: any) {
    return this.dashboardService.getPreSalesDashboard(req.user?.id);
  }

  /** Detailed Analytics for Pre-Sales */
  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.preSalesAnalytics.getPreSalesAnalytics(req.user?.id, timeRange);
  }

  /** Monthly leaderboard for the department */
  @Get('leaderboard')
  getLeaderboard(@Req() req: any) {
    return this.dashboardService.getLeaderboard(req.user?.id);
  }

  /** Confirm a follow-up (requires call record today) */
  @Post('follow-ups/:followUpId/confirm')
  confirmFollowUp(@Param('followUpId') followUpId: string, @Req() req: any) {
    return this.dashboardService.confirmFollowUp(followUpId, req.user?.id);
  }

  /** Employee fetches their active cold-call task target */
  @Get('my-task')
  getMyTask(@Req() req: any) {
    return this.employeesService.getMyTask(req.user?.id);
  }

  /** Employee fetches active announcements from their manager */
  @Get('my-announcements')
  getMyAnnouncements(@Req() req: any) {
    return this.employeesService.getMyAnnouncements(req.user?.id);
  }
}

// ─── Pre-Sales Manager Dashboard ─────────────────────────────────────────────

@Controller('api/dashboard/pre-sales-manager')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'PRE_SALES_MANAGER')
export class DashboardManagerController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getManagerDashboard(@Req() req: any) {
    return this.dashboardService.getPreSalesManagerDashboard(req.user?.id);
  }

  @Get('analytics')
  getManagerAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.dashboardService.getPreSalesManagerAnalytics(
      req.user?.id,
      timeRange,
    );
  }

  @Get('leaderboard')
  getManagerLeaderboard(@Req() req: any) {
    return this.dashboardService.getManagerLeaderboard(req.user?.id);
  }
}

// ─── Sales Manager Dashboard ──────────────────────────────────────────────────

@Controller('api/dashboard/sales-manager')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER')
export class SalesManagerDashboardController {
  constructor(
    private readonly salesManagerService: SalesManagerDashboardService,
    private readonly salesManagerAnalytics: SalesManagerAnalyticsService,
  ) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.salesManagerService.getSalesManagerDashboard(req.user?.id);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    const userId = req.user?.id;
    const subs =
      await this.salesManagerAnalytics.getManagerSubordinates(userId);
    const userIds = [userId, ...subs];

    const [financial, funnel, leaderboard, inventory, detailedMetrics] =
      await Promise.all([
        this.salesManagerAnalytics.getTeamFinancialMetrics(userIds, timeRange),
        this.salesManagerAnalytics.getTeamFunnelMetrics(userIds, timeRange),
        this.salesManagerAnalytics.getTeamLeaderboard(userIds, timeRange),
        this.salesManagerAnalytics.getInventoryAnalytics(userId),
        this.salesManagerAnalytics.getDetailedMetrics(userIds, timeRange),
      ]);

    return { financial, funnel, leaderboard, inventory, detailedMetrics };
  }

  @Get('assign-me')
  async assignMe(@Req() req: any) {
    // Temporary endpoint to instantly assign the logged in manager to the first tower
    const userId = req.user?.id;
    return this.salesManagerService['prisma'].$transaction(async (tx) => {
      const tower = await tx.tower.findFirst();
      if (!tower) return { message: 'No towers exist' };

      const existing = await tx.towerAssignment.findFirst({
        where: { userId, towerId: tower.id, role: 'SOURCING_MANAGER' },
      });

      if (existing) return { message: 'Already assigned', tower: tower.name };

      await tx.towerAssignment.create({
        data: { userId, towerId: tower.id, role: 'SOURCING_MANAGER' },
      });

      return { message: 'Assigned successfully', tower: tower.name };
    });
  }
}

// ─── Sales Executive Dashboard ───────────────────────────────────────────────

@Controller('api/dashboard/sales-executive')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER', 'SALES_EXECUTIVE')
export class SalesExecDashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly salesExecAnalytics: SalesExecAnalyticsService,
  ) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.dashboardService.getSalesExecDashboard(req.user?.id);
  }

  @Get('leaderboard')
  getLeaderboard(@Req() req: any) {
    return this.dashboardService.getSalesExecLeaderboard(req.user?.id);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    const userId = req.user?.id;
    return this.salesExecAnalytics.getAllAnalytics(userId);
  }
}

// ─── Post-Sales Dashboard ────────────────────────────────────────────────────

@Controller('api/dashboard/post-sales')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'POST_SALES_MANAGER', 'POST_SALES')
export class PostSalesDashboardController {
  constructor(
    private readonly postSalesDashboardService: PostSalesDashboardService,
    private readonly postSalesAnalyticsService: PostSalesAnalyticsService,
  ) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.postSalesDashboardService.getPostSalesDashboard(
      req.user?.id,
      req.user?.roleId,
    );
  }

  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.postSalesAnalyticsService.getPostSalesAnalytics(
      req.user?.id,
      timeRange,
      req.user?.roleId,
    );
  }
}

// ─── Employees (Manager-scoped) ───────────────────────────────────────────────

@Controller('api/dashboard/pre-sales-manager/employees')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'PRE_SALES_MANAGER')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly preSalesDashboard: PreSalesDashboardService,
    private readonly preSalesAnalytics: PreSalesAnalyticsService,
  ) {}

  /** Employee cards grid with this-month stats */
  @Get()
  getEmployeeCards(@Req() req: any) {
    return this.employeesService.getEmployeeCards(req.user?.id);
  }

  // ── View-As ──

  /** Manager views a specific employee's full pre-sales dashboard data */
  @Get(':employeeId/dashboard')
  async getEmployeeDashboard(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return the actual pre-sales dashboard data scoped to the employee
    return this.preSalesDashboard.getPreSalesDashboard(employeeId);
  }

  /** Manager views a specific employee's analytics data */
  @Get(':employeeId/analytics')
  async getEmployeeAnalytics(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return analytics for the specific employee
    return this.preSalesAnalytics.getPreSalesAnalytics(employeeId, timeRange);
  }

  // ── Tasks ──

  /** List all active tasks created by this manager */
  @Get('tasks')
  getActiveTasks(@Req() req: any) {
    return this.employeesService.getActiveTasks(req.user?.id);
  }

  /** Create a new cold-call task */
  @Post('tasks')
  createTask(@Req() req: any, @Body() body: CreateTaskDto) {
    return this.employeesService.createTask(req.user?.id, body);
  }

  /** Edit task target or set a per-employee backlog override */
  @Patch('tasks/:taskId')
  updateTask(
    @Param('taskId') taskId: string,
    @Req() req: any,
    @Body() body: UpdateTaskDto,
  ) {
    return this.employeesService.updateTask(taskId, req.user?.id, body);
  }

  /** Soft-delete (deactivate) a task */
  @Delete('tasks/:taskId')
  deleteTask(@Param('taskId') taskId: string, @Req() req: any) {
    return this.employeesService.deleteTask(taskId, req.user?.id);
  }

  // ── Announcements ──

  /** List all announcements created by this manager */
  @Get('announcements')
  getAnnouncements(@Req() req: any) {
    return this.employeesService.getManagerAnnouncements(req.user?.id);
  }

  /** Create a new announcement */
  @Post('announcements')
  createAnnouncement(@Req() req: any, @Body() body: CreateAnnouncementDto) {
    return this.employeesService.createAnnouncement(req.user?.id, body);
  }

  /** Update an existing announcement */
  @Patch('announcements/:id')
  updateAnnouncement(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.employeesService.updateAnnouncement(id, req.user?.id, body);
  }

  /** Soft-delete an announcement (immediately hidden from employees) */
  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.deleteAnnouncement(id, req.user?.id);
  }
}

// ─── Sales Manager Employees ──────────────────────────────────────────────────

@Controller('api/dashboard/sales-manager/employees')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'SALES_MANAGER')
export class SalesManagerEmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly salesExecDashboard: SalesExecDashboardService,
    private readonly salesExecAnalytics: SalesExecAnalyticsService,
  ) {}

  /** Employee cards grid with this-month stats */
  @Get()
  getEmployeeCards(@Req() req: any) {
    return this.employeesService.getSalesManagerEmployeeCards(req.user?.id);
  }

  // ── View-As ──

  /** Manager views a specific employee's full sales exec dashboard data */
  @Get(':employeeId/dashboard')
  async getEmployeeDashboard(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getSalesEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return the actual sales exec dashboard data scoped to the employee
    return this.salesExecDashboard.getSalesExecDashboard(employeeId);
  }

  /** Manager views a specific employee's analytics data */
  @Get(':employeeId/analytics')
  async getEmployeeAnalytics(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getSalesEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return analytics for the specific employee
    const [financial, funnel, inventory, project, activity] = await Promise.all(
      [
        this.salesExecAnalytics.getFinancialMetrics(employeeId),
        this.salesExecAnalytics.getFunnelMetrics(employeeId),
        this.salesExecAnalytics.getInventoryAnalytics(employeeId),
        this.salesExecAnalytics.getProjectAnalytics(employeeId),
        this.salesExecAnalytics.getActivityAnalytics(employeeId),
      ],
    );
    return { financial, funnel, inventory, project, activity };
  }

  // ── Announcements ──

  /** List all announcements created by this manager */
  @Get('announcements')
  getAnnouncements(@Req() req: any) {
    return this.employeesService.getManagerAnnouncements(req.user?.id);
  }

  /** Create a new announcement */
  @Post('announcements')
  createAnnouncement(@Req() req: any, @Body() body: CreateAnnouncementDto) {
    return this.employeesService.createAnnouncement(req.user?.id, body);
  }

  /** Update an existing announcement */
  @Patch('announcements/:id')
  updateAnnouncement(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.employeesService.updateAnnouncement(id, req.user?.id, body);
  }

  /** Soft-delete an announcement (immediately hidden from employees) */
  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.deleteAnnouncement(id, req.user?.id);
  }
}

// --- Channel Partner Employees --------------------------------------------------

@Controller('api/dashboard/channel-partner/employees')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'CHANNEL_PARTNER')
export class ChannelPartnerEmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly sourcingDashboardService: SourcingManagerDashboardService,
    private readonly closingDashboardService: ClosingManagerDashboardService,
  ) {}

  @Get('sourcing-managers')
  getSourcingManagerCards(@Req() req: any) {
    return this.employeesService.getCPSourcingManagerCards(req.user?.id);
  }

  @Get('closing-managers')
  getClosingManagerCards(@Req() req: any) {
    return this.employeesService.getCPClosingManagerCards(req.user?.id);
  }

  @Get(':employeeId/sourcing/dashboard')
  async getSourcingEmployeeDashboard(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    // Note: If you want to validate relation, do it here. We'll fetch dashboard directly for now.
    return this.sourcingDashboardService.getDashboard(employeeId);
  }

  @Get(':employeeId/closing/dashboard')
  async getClosingEmployeeDashboard(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    return this.closingDashboardService.getDashboard(employeeId);
  }
}

// --- Post-Sales Manager Employees -----------------------------------------------

@Controller('api/dashboard/post-sales-manager/employees')
@Roles('ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER', 'POST_SALES_MANAGER')
export class PostSalesManagerEmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly postSalesDashboard: PostSalesDashboardService,
    private readonly postSalesAnalytics: PostSalesAnalyticsService,
  ) {}

  /** Employee cards grid with this-month stats */
  @Get()
  getEmployeeCards(@Req() req: any) {
    return this.employeesService.getPostSalesManagerEmployeeCards(req.user?.id);
  }

  // ── View-As ──

  /** Manager views a specific employee's full post-sales dashboard data */
  @Get(':employeeId/dashboard')
  async getEmployeeDashboard(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getPostSalesEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return the actual post-sales dashboard data scoped to the employee
    return this.postSalesDashboard.getPostSalesDashboard(employeeId);
  }

  /** Manager views a specific employee's analytics data */
  @Get(':employeeId/analytics')
  async getEmployeeAnalytics(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
  ) {
    // Validate manager-employee relationship first
    await this.employeesService.getPostSalesEmployeeDashboardData(
      req.user?.id,
      employeeId,
    );
    // Return analytics for the specific employee (no roleId override needed, it falls back to employee role)
    return this.postSalesAnalytics.getPostSalesAnalytics(employeeId, timeRange);
  }

  // ── Announcements ──

  /** List all announcements created by this manager */
  @Get('announcements')
  getAnnouncements(@Req() req: any) {
    return this.employeesService.getManagerAnnouncements(req.user?.id);
  }

  /** Create a new announcement */
  @Post('announcements')
  createAnnouncement(@Req() req: any, @Body() body: CreateAnnouncementDto) {
    return this.employeesService.createAnnouncement(req.user?.id, body);
  }

  /** Update an existing announcement */
  @Patch('announcements/:id')
  updateAnnouncement(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.employeesService.updateAnnouncement(id, req.user?.id, body);
  }

  /** Soft-delete an announcement (immediately hidden from employees) */
  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.deleteAnnouncement(id, req.user?.id);
  }
}
