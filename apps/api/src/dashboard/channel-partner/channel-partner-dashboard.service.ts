import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class ChannelPartnerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, period?: string) {
    // 1. Find the User (Channel Partner Manager)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Handle date filtering
    let dateFilter: any = undefined;
    const now = new Date();
    if (period === 'weekly') {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      dateFilter = { gte: start };
    } else if (period === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: start };
    } else if (period === 'yearly') {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter = { gte: start };
    }

    const cpProjects = await this.prisma.project.findMany({
      where: { isCpProject: true },
    });
    const cpProjectIds = cpProjects.map((p) => p.id);

    // Booking filter
    const bookingFilter: any = {
      status: { not: 'CANCELLED' },
      unit: {
        floor: {
          tower: {
            projectId: { in: cpProjectIds },
          },
        },
      },
    };
    if (dateFilter) {
      bookingFilter.bookingDate = dateFilter;
    }

    // Lead filter
    const leadFilter: any = {
      brokerId: { not: null },
      status: { notIn: ['HANDOVER', 'LOST'] },
    };
    if (dateFilter) {
      leadFilter.createdAt = dateFilter;
    }

    // 2. Fetch Top-Level KPIs across ALL brokers
    const bookingsForWidgets = await this.prisma.booking.findMany({
      where: bookingFilter,
      include: {
        customer: {
          include: { lead: true },
        },
        brokerageRecords: true,
      },
    });

    let totalBookings = 0;
    let totalUnitsSold = 0;
    let totalBookingRevenue = 0;
    let totalRevenueGenerated = 0;
    let totalBrokerCommission = 0;
    const uniqueBrokers = new Set<string>();

    for (const booking of bookingsForWidgets) {
      totalBookings += 1;
      totalUnitsSold += 1;
      totalBookingRevenue += Number(booking.tokenAmount) || 0;
      totalRevenueGenerated += Number(booking.agreedPrice) || 0;
      totalBrokerCommission += Number(booking.commissionAmount) || 0;

      if (booking.customer?.lead?.brokerId) {
        uniqueBrokers.add(booking.customer.lead.brokerId);
      }
      for (const record of booking.brokerageRecords) {
        if (record.brokerId) {
          uniqueBrokers.add(record.brokerId);
        }
      }
    }
    const totalBrokers = uniqueBrokers.size;

    const totalLeads = await this.prisma.lead.count({
      where: leadFilter,
    });

    const totalFollowsPending = await this.prisma.followUp.count({
      where: dateFilter
        ? {
            brokerId: { not: null },
            status: { not: 'COMPLETED' },
            scheduledDate: dateFilter,
          }
        : { brokerId: { not: null }, status: { not: 'COMPLETED' } },
    });

    // 3. Action Tasks (Unified: Urgent Follow-ups, Site Visits, Handovers)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pendingFollowUps = await this.prisma.followUp.findMany({
      where: {
        brokerId: { not: null },
        status: 'SCHEDULED',
        scheduledDate: {
          lte: tomorrow,
          ...(dateFilter ? { gte: dateFilter.gte } : {}),
        },
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        broker: { select: { id: true, name: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 5,
    });

    const pendingSiteVisits = await this.prisma.siteVisit.findMany({
      where: {
        lead: { brokerId: { not: null } },
        status: 'ASSIGNED',
        scheduledDate: {
          lte: tomorrow,
          ...(dateFilter ? { gte: dateFilter.gte } : {}),
        },
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { name: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 5,
    });

    const pendingHandovers = await this.prisma.booking.findMany({
      where: {
        ...bookingFilter,
        status: 'CONFIRMED',
        possession: null, // assuming no possession record means pending handover
      },
      include: {
        customer: { include: { lead: true } },
        unit: {
          include: {
            floor: { include: { tower: { include: { project: true } } } },
          },
        },
      },
      orderBy: { bookingDate: 'asc' },
      take: 5,
    });

    // Transform tasks into a unified feed
    const actionTasks = [
      ...pendingFollowUps.map((f) => ({
        id: `fu-${f.id}`,
        type: 'FOLLOW_UP',
        title: f.lead
          ? `Follow up with ${f.lead.firstName || 'Lead'} ${f.lead.lastName || ''}`
          : `Follow up with Broker ${f.broker?.name || ''}`,
        date: f.scheduledDate,
        leadId: f.leadId,
        brokerId: f.brokerId,
        metadata: {},
      })),
      ...pendingSiteVisits.map((s) => ({
        id: `sv-${s.id}`,
        type: 'SITE_VISIT',
        title: `Site visit for ${s.lead?.firstName || 'Lead'} ${s.lead?.lastName || ''} at ${s.project?.name || 'Project'}`,
        date: s.scheduledDate,
        leadId: s.leadId,
        metadata: { project: s.project?.name },
      })),
      ...pendingHandovers.map((b) => ({
        id: `ho-${b.id}`,
        type: 'HANDOVER',
        title: `Pending handover for ${b.customer.lead?.firstName} ${b.customer.lead?.lastName}`,
        date: b.bookingDate,
        leadId: b.customer.leadId,
        metadata: { project: b.unit?.floor?.tower?.project?.name },
      })),
    ]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);

    // 4. Leaderboards (Top Projects, Closing Managers, Top Sourcing Managers, Top Brokers)
    const allBookings = await this.prisma.booking.findMany({
      where: bookingFilter,
      include: {
        unit: {
          include: {
            floor: { include: { tower: { include: { project: true } } } },
          },
        },
        closingManager: true,
        brokerageRecords: { include: { broker: true } },
        customer: { include: { lead: true } },
      },
    });

    // We already fetched cpProjects at the top!
    const allBrokersList = await this.prisma.broker.findMany();
    const sourcingManagers = await this.prisma.user.findMany({
      where: { role: { code: 'SOURCING_MANAGER' } },
    });
    const closingManagers = await this.prisma.user.findMany({
      where: { role: { code: 'CLOSING_MANAGER' } },
    });
    const activeAssignments = await this.prisma.projectAssignment.findMany({
      where: { isActive: true },
    });

    // Initialize counts with 0
    const projectCounts = cpProjects.reduce(
      (acc, p) => {
        acc[p.id] = { id: p.id, name: p.name, bookings: 0 };
        return acc;
      },
      {} as Record<string, any>,
    );
    const brokerCounts = allBrokersList.reduce(
      (acc, b) => {
        acc[b.id] = { id: b.id, name: b.name, bookings: 0 };
        return acc;
      },
      {} as Record<string, any>,
    );
    const smCounts = sourcingManagers.reduce(
      (acc, u) => {
        acc[u.id] = {
          id: u.id,
          name: u.name || u.username || 'Unknown',
          successfulBrokers: new Set<string>(),
        };
        return acc;
      },
      {} as Record<string, any>,
    );
    const cmCounts = closingManagers.reduce(
      (acc, u) => {
        acc[u.id] = {
          id: u.id,
          name: u.name || u.username || 'Unknown',
          bookings: 0,
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    allBookings.forEach((b) => {
      const projId = b.unit?.floor?.tower?.projectId;
      if (projId && projectCounts[projId]) projectCounts[projId].bookings++;

      const cmIdsToCredit = new Set<string>();
      if (b.closingManagerId) cmIdsToCredit.add(b.closingManagerId);
      if (projId) {
        activeAssignments
          .filter((a) => a.projectId === projId)
          .forEach((a) => cmIdsToCredit.add(a.userId));
      }
      cmIdsToCredit.forEach((cmId) => {
        if (cmCounts[cmId]) cmCounts[cmId].bookings++;
      });

      const brokerIdsForBooking = new Set<string>();
      if (b.customer?.lead?.brokerId)
        brokerIdsForBooking.add(b.customer.lead.brokerId);
      b.brokerageRecords.forEach((br) => {
        if (br.brokerId) brokerIdsForBooking.add(br.brokerId);
      });

      brokerIdsForBooking.forEach((brkId) => {
        if (brokerCounts[brkId]) {
          brokerCounts[brkId].bookings++;

          const brokerProfile = allBrokersList.find(
            (brProfile) => brProfile.id === brkId,
          );
          const smId = brokerProfile?.sourcingManagerId;
          if (smId && smCounts[smId]) {
            smCounts[smId].successfulBrokers.add(brkId);
          }
        }
      });
    });

    const topProjects = Object.values(projectCounts)
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);
    const topClosingManagers = Object.values(cmCounts)
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);
    const topBrokers = Object.values(brokerCounts)
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);
    const topSourcingManagers = Object.values(smCounts)
      .map((sm: any) => ({ ...sm, bookings: sm.successfulBrokers.size }))
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);

    // Pipeline aggregation across CP Leads
    const pipelineCounts = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        OR: [
          { brokerId: { not: null } },
          { interestedProject: { isCpProject: true } },
        ],
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
      'NEGOTIATION',
      'BOOKING',
      'LOST',
    ];
    const pipelineMap: Record<string, number> = {};
    pipelineStages.forEach((s) => (pipelineMap[s] = 0));
    pipelineCounts.forEach((p) => {
      pipelineMap[p.status] = p._count.status;
    });

    pipelineMap['new'] = pipelineMap['NEW'];
    pipelineMap['contacted'] = pipelineMap['CONTACTED'];
    pipelineMap['interested'] = pipelineMap['INTERESTED'];
    pipelineMap['qualified'] = pipelineMap['QUALIFIED'];
    pipelineMap['siteVisit'] =
      (pipelineMap['SITE_VISIT_SCHEDULED'] || 0) +
      (pipelineMap['SITE_VISIT_COMPLETED'] || 0);
    pipelineMap['negotiation'] = pipelineMap['NEGOTIATION'] || 0;
    pipelineMap['booked'] = pipelineMap['BOOKING'] || totalBookings;
    pipelineMap['lost'] = pipelineMap['LOST'] || 0;

    return {
      broker: {
        id: user.id,
        name: user.name || user.username || 'Channel Partner Manager',
        code: 'N/A',
      },
      kpis: {
        totalBookings,
        totalUnitsSold,
        totalBookingRevenue,
        totalRevenueGenerated,
        totalBrokerCommission,
        totalBrokers,
        totalFollowsPending,
        totalLeads,
      },
      pipeline: pipelineMap,
      actionTasks,
      leaderboards: {
        topProjects,
        topClosingManagers,
        topSourcingManagers,
        topBrokers,
      },
    };
  }
}
