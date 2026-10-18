import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getTodayRange, getStartDate } from '../core/dashboard.utils.js';

@Injectable()
export class ManagerDashboardService {
  constructor(private prisma: PrismaService) {}

  private async resolvePreSalesTeam(managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { role: true },
    });
    const isSupervisory =
      manager?.role?.code === 'ADMIN' ||
      manager?.role?.code === 'DIRECTOR' ||
      manager?.role?.code === 'BUSINESS_MANAGER';

    let subs = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, username: true },
    });

    if (isSupervisory || subs.length === 0) {
      const psRole = await this.prisma.role.findFirst({
        where: { code: 'PRE_SALES' },
      });
      if (psRole) {
        const allAgents = await this.prisma.user.findMany({
          where: { roleId: psRole.id, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, username: true },
        });
        if (allAgents.length > 0) {
          subs = allAgents;
        }
      }
    }

    const userIds = Array.from(new Set([managerId, ...subs.map((s) => s.id)]));
    return { userIds, subs, isSupervisory };
  }

  async getPreSalesManagerDashboard(managerId: string) {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const { userIds, subs } = await this.resolvePreSalesTeam(managerId);

    const [
      newLeadsCount,
      activeLeadsCount, // CONTACTED
      lostLeadsCount, // LOST
      totalLeadsCount,
      todayFollowUpsCount,
      missedFollowUpsCount,
      siteVisitsScheduled,
      pipelineCounts,
      todayFollowUpList,
      backlogRecords,
    ] = await Promise.all([
      this.prisma.lead.count({
        where: {
          OR: [
            { assignedUserId: { in: userIds } },
            { assignedUserId: null }, // Unassigned queue for pre-sales team
          ],
          status: 'NEW',
          deletedAt: null,
        },
      }),
      this.prisma.lead.count({
        where: {
          assignedUserId: { in: userIds },
          status: 'CONTACTED',
          deletedAt: null,
        },
      }),
      this.prisma.lead.count({
        where: {
          assignedUserId: { in: userIds },
          status: 'LOST',
          deletedAt: null,
        },
      }),
      this.prisma.lead.count({
        where: {
          OR: [
            { assignedUserId: { in: userIds } },
            { assignedUserId: null, status: 'NEW' },
          ],
          deletedAt: null,
        },
      }),
      this.prisma.followUp.count({
        where: {
          userId: { in: userIds },
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
      }),
      this.prisma.followUp.count({
        where: {
          userId: { in: userIds },
          status: 'MISSED',
          lead: { deletedAt: null },
        },
      }),
      this.prisma.siteVisit.count({ where: { salesExecId: { in: userIds } } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: {
          OR: [
            { assignedUserId: { in: userIds } },
            { assignedUserId: null, status: 'NEW' },
          ],
          deletedAt: null,
        },
        _count: { status: true },
      }),
      this.prisma.followUp.findMany({
        where: {
          userId: { in: userIds },
          scheduledDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          lead: { deletedAt: null },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true,
          scheduledDate: true,
          status: true,
          user: { select: { id: true, name: true, username: true } },
          lead: {
            select: { id: true, firstName: true, lastName: true, status: true },
          },
        },
      }),
      // Backlog counts grouped by agent
      this.prisma.followUp.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, status: 'MISSED' },
        _count: { userId: true },
      }),
    ]);

    // Untouched leads (NEW status) grouped by user
    const untouchedLeads = await this.prisma.lead.groupBy({
      by: ['assignedUserId'],
      where: {
        assignedUserId: { in: userIds },
        status: 'NEW',
        deletedAt: null,
      },
      _count: { assignedUserId: true },
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
    pipelineStages.forEach((s) => (pipelineMap[s] = 0));
    pipelineCounts.forEach((p) => (pipelineMap[p.status] = p._count.status));

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

    const conversionRate =
      newLeadsCount > 0
        ? Math.round(
            (siteVisitsScheduled / (newLeadsCount + siteVisitsScheduled)) * 100,
          )
        : 0;

    // Build backlog grouped by agent
    const backlogsByAgent = subs.map((sub) => {
      const missed =
        backlogRecords.find((b) => b.userId === sub.id)?._count.userId || 0;
      const untouched =
        untouchedLeads.find((u) => u.assignedUserId === sub.id)?._count
          .assignedUserId || 0;
      return {
        id: sub.id,
        name: sub.name || sub.username,
        missedFollowUps: missed,
        untouchedLeads: untouched,
      };
    });

    return {
      widgets: {
        totalLeads: totalLeadsCount,
        newLeads: newLeadsCount,
        activeLeads: activeLeadsCount,
        lostLeads: lostLeadsCount,
        todayFollowUps: todayFollowUpsCount,
        missedFollowUps: missedFollowUpsCount,
        siteVisitsScheduled,
        conversionRate,
      },
      pipeline: pipelineMap,
      todayFollowUpList,
      backlogs: backlogsByAgent,
    };
  }
  async getPreSalesManagerAnalytics(managerId: string, timeRange?: string) {
    const startDate = getStartDate(timeRange);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const { userIds } = await this.resolvePreSalesTeam(managerId);

    const commonWhere = {
      OR: [
        { assignedUserId: { in: userIds } },
        { assignedUserId: null },
      ],
      deletedAt: null,
      ...(dateFilter ? { updatedAt: dateFilter } : {}),
    };

    // 1. Pipeline Metrics (Plus-only/Cumulative)
    const pipelineGroups = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        ...commonWhere,
        status: { not: 'LOST' },
      },
      _count: true,
    });

    const lostLeads = await this.prisma.lead.count({
      where: {
        ...commonWhere,
        status: 'LOST',
      },
    });

    const counts = pipelineGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const booked = counts['BOOKING'] || 0;
    const visitCompleted = (counts['SITE_VISIT_COMPLETED'] || 0) + booked;
    const visitScheduled =
      (counts['SITE_VISIT_SCHEDULED'] || 0) + visitCompleted;
    const qualified = (counts['QUALIFIED'] || 0) + visitScheduled;
    const interested = (counts['INTERESTED'] || 0) + qualified;
    const contacted = (counts['CONTACTED'] || 0) + interested;
    const newLeads = (counts['NEW'] || 0) + contacted;

    const totalLeads = newLeads + lostLeads;
    const siteVisits = visitScheduled;

    // 2. Call Metrics
    const callCommonWhere = {
      userId: { in: userIds },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };

    const callGroups = await this.prisma.callRecord.groupBy({
      by: ['status'],
      where: callCommonWhere,
      _count: { _all: true },
      _avg: { duration: true },
    });

    const callsMap = callGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = {
          count: curr._count._all,
          avgDuration: curr._avg?.duration || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; avgDuration: number }>,
    );

    const callsConnected = callsMap['CONNECTED']?.count || 0;
    const callsNotAnswered = callsMap['NOT_ANSWERED']?.count || 0;
    const callsBusy = callsMap['BUSY']?.count || 0;
    const callsFailed = callsMap['FAILED']?.count || 0;
    const callsVoicemail = callsMap['VOICEMAIL']?.count || 0;

    const callsMade =
      callsConnected +
      callsNotAnswered +
      callsBusy +
      callsFailed +
      callsVoicemail;
    const connectedPercentage =
      callsMade > 0 ? (callsConnected / callsMade) * 100 : 0;
    const avgTalkTime = callsMap['CONNECTED']?.avgDuration || 0;

    const leadToSiteVisitPercentage =
      totalLeads > 0 ? (siteVisits / totalLeads) * 100 : 0;

    // 3. Follow-Up Metrics
    const followUpCommonWhere = {
      userId: { in: userIds },
      ...(dateFilter ? { scheduledDate: dateFilter } : {}),
    };

    const followUpGroups = await this.prisma.followUp.groupBy({
      by: ['status'],
      where: followUpCommonWhere,
      _count: { _all: true },
    });

    const followUpsMap = followUpGroups.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      },
      {} as Record<string, number>,
    );

    const followUpsCompleted = followUpsMap['COMPLETED'] || 0;

    // 4. Lead Source Conversion (Site Visits by Source)
    const siteVisitsBySourceQuery = await this.prisma.lead.groupBy({
      by: ['sourceId'],
      where: {
        ...commonWhere,
        status: {
          in: ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'BOOKING'],
        },
      },
      _count: { _all: true },
    });

    const sourceIds = siteVisitsBySourceQuery
      .map((g) => g.sourceId)
      .filter(Boolean) as string[];
    const leadSourcesData = await this.prisma.leadSource.findMany({
      where: { id: { in: sourceIds } },
    });
    const sourceMap = new Map(leadSourcesData.map((s) => [s.id, s.name]));

    const leadSources = siteVisitsBySourceQuery
      .map((group) => ({
        source: group.sourceId
          ? sourceMap.get(group.sourceId) || 'Unknown'
          : 'Organic/Other',
        count: group._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Speed to Lead (Average diff between lead createdAt and first callRecord createdAt)
    // For simplicity without a complex raw query, we will fetch leads and their first call.
    // If team is large, a raw SQL query might be better, but we will use prisma for now.
    const leadsWithCalls = await this.prisma.lead.findMany({
      where: {
        assignedUserId: { in: userIds },
        callRecords: { some: {} },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      select: {
        createdAt: true,
        callRecords: {
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    let totalSpeedMinutes = 0;
    let leadsCountedForSpeed = 0;
    for (const lead of leadsWithCalls) {
      if (lead.callRecords.length > 0) {
        const diffMs =
          lead.callRecords[0].createdAt.getTime() - lead.createdAt.getTime();
        if (diffMs > 0) {
          // Should be positive
          totalSpeedMinutes += diffMs / 1000 / 60;
          leadsCountedForSpeed++;
        }
      }
    }
    const avgSpeedToLeadMinutes =
      leadsCountedForSpeed > 0
        ? Math.round(totalSpeedMinutes / leadsCountedForSpeed)
        : 0;

    // 6. Peak Connection Heatmap
    // Group connected calls by day of week and hour
    const connectedCalls = await this.prisma.callRecord.findMany({
      where: {
        ...callCommonWhere,
        status: 'CONNECTED',
      },
      select: { createdAt: true },
    });

    // Initialize 7x24 matrix (Day 0 = Sun, 6 = Sat) (Hour 0-23)
    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    connectedCalls.forEach((call) => {
      const d = new Date(call.createdAt);
      heatmap[d.getDay()][d.getHours()]++;
    });

    const formattedHeatmap: { day: number; hour: number; count: number }[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        formattedHeatmap.push({ day, hour, count: heatmap[day][hour] });
      }
    }

    return {
      pipeline: {
        totalLeads,
        newLeads,
        contacted,
        interested,
        qualified,
        visitScheduled,
        visitCompleted,
        siteVisits,
        booked,
        lost: lostLeads,
        NEW: newLeads,
        CONTACTED: contacted,
        INTERESTED: interested,
        QUALIFIED: qualified,
        SITE_VISIT_SCHEDULED: visitScheduled,
        SITE_VISIT_COMPLETED: visitCompleted,
        BOOKING: booked,
        LOST: lostLeads,
      },
      calls: {
        made: callsMade,
        connected: callsConnected,
        notAnswered: callsNotAnswered,
        busy: callsBusy,
        failed: callsFailed,
        voicemail: callsVoicemail,
        connectedPercentage: parseFloat(connectedPercentage.toFixed(1)),
        avgTalkTimeSeconds: Math.round(avgTalkTime),
      },
      followUps: {
        completed: followUpsCompleted,
      },
      sources: leadSources,
      conversions: {
        leadToSiteVisitPercentage: parseFloat(
          leadToSiteVisitPercentage.toFixed(1),
        ),
      },
      managerMetrics: {
        avgSpeedToLeadMinutes,
        connectionHeatmap: formattedHeatmap,
      },
    };
  }
}
