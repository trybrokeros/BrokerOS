import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange, getMonthRange } from './dashboard.utils.js';

export interface CacheSeamOptions<T> {
  dashboardType: string;
  widgetKey: string;
  period?: string;
  ttlSeconds?: number;
  compute: () => Promise<T>;
}

export interface PreSalesWidgetsResult {
  newLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  todayFollowUps: number;
  missedFollowUps: number;
  siteVisitsScheduled: number;
  bookingsGenerated: number;
}

export interface SalesExecWidgetsResult {
  siteVisitsScheduled: number;
  todaySiteVisitsDone: number;
  siteVisitsCompleted: number;
  negotiations: number;
  bookingsGenerated: number;
}

/**
 * Deep Dashboard Analytics Engine.
 * Provides transparent caching over heavy aggregation queries across all 12 role views,
 * backed by the dedicated DashboardCache table with configurable TTL.
 */
@Injectable()
export class DashboardAnalyticsEngineService {
  private readonly logger = new Logger(DashboardAnalyticsEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transparent caching seam.
   * Checks DashboardCache first. On cache hit with valid TTL, returns cached value immediately.
   * On cache miss or expiration, executes compute(), updates DashboardCache, and returns fresh value.
   */
  async getOrCompute<T>(options: CacheSeamOptions<T>): Promise<T> {
    const {
      dashboardType,
      widgetKey,
      period = 'default',
      ttlSeconds = 300,
      compute,
    } = options;

    const now = new Date();

    // 1. Attempt Cache Read
    try {
      const cached = await this.prisma.dashboardCache.findUnique({
        where: {
          dashboardType_widgetKey_period: {
            dashboardType,
            widgetKey,
            period,
          },
        },
      });

      if (cached && cached.expiresAt > now) {
        return cached.value as T;
      }
    } catch (err) {
      this.logger.warn(
        `Failed to read DashboardCache [${dashboardType}:${widgetKey}:${period}]: ${err}`,
      );
    }

    // 2. Cache Miss or Expired: Compute Fresh Value
    const freshValue = await compute();

    // 3. Populate Cache with TTL
    try {
      const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
      await this.prisma.dashboardCache.upsert({
        where: {
          dashboardType_widgetKey_period: {
            dashboardType,
            widgetKey,
            period,
          },
        },
        create: {
          dashboardType,
          widgetKey,
          period,
          value: freshValue as any,
          computedAt: now,
          expiresAt,
        },
        update: {
          value: freshValue as any,
          computedAt: now,
          expiresAt,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write DashboardCache [${dashboardType}:${widgetKey}:${period}]: ${err}`,
      );
    }

    return freshValue;
  }

  /**
   * Invalidate specific cached items by dashboard type, widget, and optional period.
   */
  async invalidate(
    dashboardType: string,
    widgetKey?: string,
    period?: string,
  ): Promise<number> {
    try {
      const where: any = { dashboardType };
      if (widgetKey) where.widgetKey = widgetKey;
      if (period) where.period = period;
      const res = await this.prisma.dashboardCache.deleteMany({ where });
      return res.count;
    } catch (err) {
      this.logger.warn(`Failed to invalidate DashboardCache: ${err}`);
      return 0;
    }
  }

  /**
   * Invalidate all cached entries for a specific user across all roles and periods.
   */
  async invalidateUser(userId: string): Promise<number> {
    try {
      const res = await this.prisma.dashboardCache.deleteMany({
        where: {
          widgetKey: {
            contains: userId,
          },
        },
      });
      return res.count;
    } catch (err) {
      this.logger.warn(`Failed to invalidate user DashboardCache: ${err}`);
      return 0;
    }
  }

  /**
   * Clean expired entries from the dashboard_cache table.
   * Can be invoked by scheduled snapshot maintenance.
   */
  async cleanExpired(): Promise<number> {
    try {
      const res = await this.prisma.dashboardCache.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });
      return res.count;
    } catch (err) {
      this.logger.warn(`Failed to clean expired DashboardCache: ${err}`);
      return 0;
    }
  }

  // ── Consolidated Domain Analytics Aggregators ──────────────────────────────

  /**
   * Pre-Sales Widgets with 3-minute caching seam.
   */
  async getPreSalesWidgets(userId: string): Promise<PreSalesWidgetsResult> {
    return this.getOrCompute({
      dashboardType: 'PRE_SALES',
      widgetKey: `widgets:${userId}`,
      period: 'today',
      ttlSeconds: 180,
      compute: async () => {
        const { start: todayStart, end: todayEnd } = getTodayRange();
        const { start: monthStart, end: monthEnd } = getMonthRange();

        const [
          newLeadsCount,
          hotLeadsCount,
          warmLeadsCount,
          coldLeadsCount,
          todayFollowUpsCount,
          missedFollowUpsCount,
          siteVisitsThisMonth,
          bookingsThisMonth,
        ] = await Promise.all([
          this.prisma.lead.count({
            where: {
              assignedUserId: userId,
              status: 'NEW',
              deletedAt: null,
            },
          }),
          this.prisma.lead.count({
            where: {
              assignedUserId: userId,
              temperature: 'HOT',
              deletedAt: null,
            },
          }),
          this.prisma.lead.count({
            where: {
              assignedUserId: userId,
              temperature: 'WARM',
              deletedAt: null,
            },
          }),
          this.prisma.lead.count({
            where: {
              assignedUserId: userId,
              temperature: 'COLD',
              deletedAt: null,
            },
          }),
          this.prisma.followUp.count({
            where: {
              userId,
              scheduledDate: { gte: todayStart, lte: todayEnd },
              status: { in: ['SCHEDULED', 'RESCHEDULED'] },
              lead: { deletedAt: null },
            },
          }),
          this.prisma.followUp.count({
            where: {
              userId,
              status: 'MISSED',
              scheduledDate: { lt: todayStart },
            },
          }),
          this.prisma.siteVisit.count({
            where: {
              createdById: userId,
              status: 'COMPLETED',
              scheduledDate: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.booking.count({
            where: {
              customer: {
                lead: {
                  siteVisits: {
                    some: { createdById: userId },
                  },
                },
              },
              status: 'CONFIRMED',
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        return {
          newLeads: newLeadsCount,
          hotLeads: hotLeadsCount,
          warmLeads: warmLeadsCount,
          coldLeads: coldLeadsCount,
          todayFollowUps: todayFollowUpsCount,
          missedFollowUps: missedFollowUpsCount,
          siteVisitsScheduled: siteVisitsThisMonth,
          bookingsGenerated: bookingsThisMonth,
        };
      },
    });
  }

  /**
   * Pre-Sales Pipeline counts with 5-minute caching seam.
   */
  async getPreSalesPipeline(
    userId: string,
  ): Promise<Record<string, number>> {
    return this.getOrCompute({
      dashboardType: 'PRE_SALES',
      widgetKey: `pipeline:${userId}`,
      period: 'month',
      ttlSeconds: 300,
      compute: async () => {
        const pipelineCounts = await this.prisma.lead.groupBy({
          by: ['status'],
          where: {
            assignedUserId: userId,
            deletedAt: null,
          },
          _count: { status: true },
        });

        const pipelineStages = [
          'NEW',
          'CONTACTED',
          'INTERESTED',
          'QUALIFIED',
          'SITE_VISIT_SCHEDULED',
          'SITE_VISIT_COMPLETED',
          'BOOKING',
          'LOST',
        ];

        const pipelineMap: Record<string, number> = {};
        pipelineStages.forEach((stage) => {
          pipelineMap[stage] = 0;
        });
        pipelineCounts.forEach((p) => {
          pipelineMap[p.status] = p._count.status;
        });

        // Universal aliases for frontend compatibility
        pipelineMap['new'] = pipelineMap['NEW'];
        pipelineMap['contacted'] = pipelineMap['CONTACTED'];
        pipelineMap['interested'] = pipelineMap['INTERESTED'];
        pipelineMap['qualified'] = pipelineMap['QUALIFIED'];
        pipelineMap['siteVisit'] =
          (pipelineMap['SITE_VISIT_SCHEDULED'] || 0) +
          (pipelineMap['SITE_VISIT_COMPLETED'] || 0);
        pipelineMap['negotiation'] = pipelineMap['NEGOTIATION'] || 0;
        pipelineMap['booked'] = pipelineMap['BOOKING'] || 0;
        pipelineMap['lost'] = pipelineMap['LOST'] || 0;

        return pipelineMap;
      },
    });
  }

  /**
   * Sales Executive Widgets with 3-minute caching seam.
   */
  async getSalesExecWidgets(userId: string): Promise<SalesExecWidgetsResult> {
    return this.getOrCompute({
      dashboardType: 'SALES_EXEC',
      widgetKey: `widgets:${userId}`,
      period: 'today',
      ttlSeconds: 180,
      compute: async () => {
        const { start: todayStart, end: todayEnd } = getTodayRange();
        const { start: monthStart, end: monthEnd } = getMonthRange();

        const [
          siteVisitsScheduledThisMonth,
          siteVisitsDoneThisMonth,
          todaySiteVisitsDone,
          bookingsThisMonth,
          negotiationsOngoing,
        ] = await Promise.all([
          this.prisma.siteVisit.count({
            where: {
              salesExecId: userId,
              scheduledDate: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.siteVisit.count({
            where: {
              salesExecId: userId,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.siteVisit.count({
            where: {
              salesExecId: userId,
              status: 'COMPLETED',
              completedAt: { gte: todayStart, lte: todayEnd },
            },
          }),
          this.prisma.booking.count({
            where: {
              salesExecId: userId,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
          }),
          this.prisma.negotiation.count({
            where: {
              salesExecId: userId,
              status: { notIn: ['CLOSED', 'REJECTED'] },
            },
          }),
        ]);

        return {
          siteVisitsScheduled: siteVisitsScheduledThisMonth,
          todaySiteVisitsDone,
          siteVisitsCompleted: siteVisitsDoneThisMonth,
          negotiations: negotiationsOngoing,
          bookingsGenerated: bookingsThisMonth,
        };
      },
    });
  }
}
