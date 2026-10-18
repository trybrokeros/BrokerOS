import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange, getMonthRange } from '../core/dashboard.utils.js';
import { DashboardAnalyticsEngineService } from '../core/dashboard-analytics-engine.service.js';

@Injectable()
export class PreSalesWidgetsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private analyticsEngine?: DashboardAnalyticsEngineService,
  ) {}

  async getWidgets(userId: string) {
    if (this.analyticsEngine) {
      return this.analyticsEngine.getPreSalesWidgets(userId);
    }
    return this.computeWidgets(userId);
  }

  async computeWidgets(userId: string) {
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
      // New Leads assigned to user
      this.prisma.lead.count({
        where: {
          assignedUserId: userId,
          status: 'NEW',
          deletedAt: null,
        },
      }),
      // Hot leads (all time, assigned to user)
      this.prisma.lead.count({
        where: { assignedUserId: userId, temperature: 'HOT', deletedAt: null },
      }),
      // Warm leads
      this.prisma.lead.count({
        where: { assignedUserId: userId, temperature: 'WARM', deletedAt: null },
      }),
      // Cold leads
      this.prisma.lead.count({
        where: { assignedUserId: userId, temperature: 'COLD', deletedAt: null },
      }),
      // Today's follow-ups (scheduled for today)
      this.prisma.followUp.count({
        where: {
          userId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
      }),
      // Missed follow-ups (all accumulated, matching the backlog logic)
      this.prisma.followUp.count({
        where: {
          userId,
          status: 'MISSED',
          scheduledDate: { lt: todayStart },
        },
      }),
      // Site visits completed this month that were scheduled by this user
      this.prisma.siteVisit.count({
        where: {
          createdById: userId,
          status: 'COMPLETED',
          scheduledDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Bookings confirmed this month for leads that had a site visit scheduled by this user
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
  }
}
