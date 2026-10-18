import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class SalesManagerWidgetsService {
  constructor(private prisma: PrismaService) {}

  async getWidgetsAndPipeline(userIds: string[]) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const [
      siteVisitsScheduledThisMonth,
      siteVisitsDoneThisMonth,
      bookingsThisMonth,
      negotiationsOngoing,
      pipelineCounts,
    ] = await Promise.all([
      // Total SV scheduled this month
      this.prisma.siteVisit.count({
        where: {
          salesExecId: { in: userIds },
          scheduledDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      // SVs completed this month
      this.prisma.siteVisit.count({
        where: {
          salesExecId: { in: userIds },
          status: 'COMPLETED',
          completedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Bookings this month
      this.prisma.booking.count({
        where: {
          salesExecId: { in: userIds },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Ongoing negotiations
      this.prisma.negotiation.count({
        where: {
          salesExecId: { in: userIds },
          status: { notIn: ['CLOSED', 'REJECTED'] },
        },
      }),
      // Pipeline stage counts (user's assigned leads)
      this.prisma.lead.groupBy({
        by: ['status'],
        where: {
          assignedUserId: { in: userIds },
          deletedAt: null,
        },
        _count: { status: true },
      }),
    ]);

    const pipelineStages = [
      'SITE_VISIT_SCHEDULED',
      'SITE_VISIT_COMPLETED',
      'NEGOTIATION',
      'BOOKING',
      'LOST',
    ];
    const pipelineMap: Record<string, number> = {};
    pipelineStages.forEach((s) => (pipelineMap[s] = 0));
    pipelineCounts.forEach((p) => {
      if (pipelineMap[p.status] !== undefined) {
        pipelineMap[p.status] = p._count.status;
      }
    });

    // Universal aliases for frontend compatibility
    pipelineMap['siteVisit'] =
      (pipelineMap['SITE_VISIT_SCHEDULED'] || 0) +
      (pipelineMap['SITE_VISIT_COMPLETED'] || 0);
    pipelineMap['negotiation'] = pipelineMap['NEGOTIATION'] || 0;
    pipelineMap['booked'] = pipelineMap['BOOKING'] || 0;
    pipelineMap['lost'] = pipelineMap['LOST'] || 0;
    pipelineMap['cancelled'] = pipelineMap['LOST'] || 0;
    pipelineMap['new'] = pipelineMap['NEW'] || 0;
    pipelineMap['contacted'] = pipelineMap['CONTACTED'] || 0;

    return {
      widgets: {
        siteVisitsScheduled: siteVisitsScheduledThisMonth,
        siteVisitsCompleted: siteVisitsDoneThisMonth,
        negotiations: negotiationsOngoing,
        bookingsGenerated: bookingsThisMonth,
      },
      pipeline: pipelineMap,
    };
  }
}
