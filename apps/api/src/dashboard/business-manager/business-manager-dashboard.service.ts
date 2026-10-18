import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getStartDate } from '../core/dashboard.utils.js';

@Injectable()
export class BusinessManagerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private buildDateFilter(period?: string): Date | undefined {
    return getStartDate(period);
  }

  private buildBookingWhere(isCp: boolean | null, startDate?: Date) {
    const base: any = { status: { not: 'CANCELLED' } };
    if (isCp !== null) {
      base.unit = {
        floor: { tower: { project: { isCpProject: isCp } } },
      };
    }
    if (startDate) {
      base.bookingDate = { gte: startDate };
    }
    return base;
  }

  // ─── Main Dashboard ───────────────────────────────────────────────────────────

  async getDashboard(period?: string) {
    const startDate = this.buildDateFilter(period);

    const [
      brokerageBookings,
      cpBookings,
      totalEmployees,
      totalBrokers,
      pendingCommissions,
      overduePayments,
      totalBrokerageLeads,
      totalCpLeads,
    ] = await Promise.all([
      // Brokerage bookings (isCpProject = false)
      this.prisma.booking.findMany({
        where: this.buildBookingWhere(false, startDate),
        select: {
          agreedPrice: true,
          tokenAmount: true,
          commissionAmount: true,
        },
      }),
      // CP bookings (isCpProject = true)
      this.prisma.booking.findMany({
        where: this.buildBookingWhere(true, startDate),
        select: {
          agreedPrice: true,
          tokenAmount: true,
          commissionAmount: true,
        },
      }),
      // Active employees
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      // Total registered brokers
      this.prisma.broker.count({ where: { deletedAt: null } }),
      // Pending broker commissions (CP world)
      this.prisma.brokerageRecord.aggregate({
        where: { status: 'PENDING' },
        _sum: { netPayable: true },
      }),
      // Overdue collection records
      this.prisma.collectionRecord.count({ where: { isOverdue: true } }),
      // Brokerage leads (no broker, not CP)
      this.prisma.lead.count({
        where: {
          brokerId: null,
          deletedAt: null,
          status: { notIn: ['LOST', 'BOOKING'] },
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      }),
      // CP leads (brought in by brokers)
      this.prisma.lead.count({
        where: {
          brokerId: { not: null },
          deletedAt: null,
          status: { notIn: ['LOST'] },
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
        },
      }),
    ]);

    // Aggregate brokerage metrics
    let brokerageRevenue = 0;
    for (const b of brokerageBookings) {
      brokerageRevenue += Number(b.agreedPrice) || 0;
    }

    // Aggregate CP metrics
    let cpRevenue = 0;
    let cpCommission = 0;
    for (const b of cpBookings) {
      cpRevenue += Number(b.agreedPrice) || 0;
      cpCommission += Number(b.commissionAmount) || 0;
    }

    const totalRevenue = brokerageRevenue + cpRevenue;
    const totalBookings = brokerageBookings.length + cpBookings.length;
    const totalLeads = totalBrokerageLeads + totalCpLeads;

    // ─── Leaderboards ─────────────────────────────────────────────────────────

    const [topSalesExecs, topSourcingManagers, topClosingManagers, topBrokers] =
      await Promise.all([
        this.getTopSalesExecs(startDate),
        this.getTopSourcingManagers(startDate),
        this.getTopClosingManagers(startDate),
        this.getTopBrokers(startDate),
      ]);

    // ─── Action Items ─────────────────────────────────────────────────────────

    const actionItems = await this.getActionItems();

    // ─── Pipeline Distribution ───────────────────────────────────────────────

    const pipelineCounts = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      _count: { status: true },
    });

    const pipelineMap: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      QUALIFIED: 0,
      SITE_VISIT_SCHEDULED: 0,
      SITE_VISIT_COMPLETED: 0,
      NEGOTIATION: 0,
      BOOKING: 0,
      LOST: 0,
    };
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
    pipelineMap['booked'] = brokerageBookings.length || pipelineMap['BOOKING'] || 0;
    pipelineMap['cpBooked'] = cpBookings.length || 0;
    pipelineMap['lost'] = pipelineMap['LOST'] || 0;

    // ─── Revenue Split ────────────────────────────────────────────────────────

    return {
      kpis: {
        // Combined
        totalRevenue,
        totalBookings,
        totalUnitsSold: totalBookings, // 1 booking = 1 unit
        totalLeads,
        totalEmployees,
        totalBrokers,
        pendingCommissions: Number(pendingCommissions._sum.netPayable) || 0,
        overduePayments,
        // Split
        brokerageRevenue,
        cpRevenue,
        cpCommission,
        brokerageBookings: brokerageBookings.length,
        cpBookings: cpBookings.length,
        brokerageLeads: totalBrokerageLeads,
        cpLeads: totalCpLeads,
      },
      pipeline: pipelineMap,
      revenueByBusiness: {
        brokerage: brokerageRevenue,
        cp: cpRevenue,
        total: totalRevenue,
        brokeragePercent:
          totalRevenue > 0
            ? parseFloat(((brokerageRevenue / totalRevenue) * 100).toFixed(1))
            : 0,
        cpPercent:
          totalRevenue > 0
            ? parseFloat(((cpRevenue / totalRevenue) * 100).toFixed(1))
            : 0,
      },
      leaderboards: {
        topSalesExecs,
        topSourcingManagers,
        topClosingManagers,
        topBrokers,
      },
      actionItems,
    };
  }

  // ─── Leaderboard Helpers ──────────────────────────────────────────────────────

  private async getTopSalesExecs(startDate?: Date) {
    // Brokerage bookings grouped by salesExecId
    const bookings = await this.prisma.booking.findMany({
      where: {
        ...this.buildBookingWhere(false, startDate),
        salesExecId: { not: null },
      },
      select: { salesExecId: true, agreedPrice: true },
    });

    const map: Record<
      string,
      { id: string; name: string; bookings: number; revenue: number }
    > = {};
    const userIds = [...new Set(bookings.map((b) => b.salesExecId as string))];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true },
    });
    const userMap = new Map(
      users.map((u) => [u.id, u.name || u.username || 'Unknown']),
    );

    for (const b of bookings) {
      const id = b.salesExecId!;
      if (!map[id])
        map[id] = {
          id,
          name: userMap.get(id) || 'Unknown',
          bookings: 0,
          revenue: 0,
        };
      map[id].bookings++;
      map[id].revenue += Number(b.agreedPrice) || 0;
    }

    return Object.values(map)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }

  private async getTopSourcingManagers(startDate?: Date) {
    // CP bookings brought by brokers — trace back to their SM
    const cpBookings = await this.prisma.booking.findMany({
      where: this.buildBookingWhere(true, startDate),
      include: {
        brokerageRecords: { select: { brokerId: true } },
        customer: { include: { lead: { select: { brokerId: true } } } },
      },
    });

    // Collect all unique broker IDs from these bookings
    const brokerIds = new Set<string>();
    for (const b of cpBookings) {
      if (b.customer?.lead?.brokerId) brokerIds.add(b.customer.lead.brokerId);
      for (const br of b.brokerageRecords) {
        if (br.brokerId) brokerIds.add(br.brokerId);
      }
    }

    // Get sourcing manager for each broker
    const brokers = await this.prisma.broker.findMany({
      where: { id: { in: [...brokerIds] }, sourcingManagerId: { not: null } },
      select: { id: true, sourcingManagerId: true },
    });

    const smBrokerMap: Record<string, Set<string>> = {};
    for (const broker of brokers) {
      const smId = broker.sourcingManagerId!;
      if (!smBrokerMap[smId]) smBrokerMap[smId] = new Set();
      smBrokerMap[smId].add(broker.id);
    }

    const smIds = Object.keys(smBrokerMap);
    if (smIds.length === 0) return [];

    const sms = await this.prisma.user.findMany({
      where: { id: { in: smIds } },
      select: { id: true, name: true, username: true },
    });

    return sms
      .map((sm) => ({
        id: sm.id,
        name: sm.name || sm.username || 'Unknown',
        activeBrokers: smBrokerMap[sm.id]?.size || 0,
      }))
      .sort((a, b) => b.activeBrokers - a.activeBrokers)
      .slice(0, 5);
  }

  private async getTopClosingManagers(startDate?: Date) {
    const cpBookings = await this.prisma.booking.findMany({
      where: {
        ...this.buildBookingWhere(true, startDate),
        closingManagerId: { not: null },
      },
      select: { closingManagerId: true, agreedPrice: true },
    });

    const map: Record<
      string,
      { id: string; name: string; bookings: number; revenue: number }
    > = {};
    const userIds = [
      ...new Set(cpBookings.map((b) => b.closingManagerId as string)),
    ];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true },
    });
    const userMap = new Map(
      users.map((u) => [u.id, u.name || u.username || 'Unknown']),
    );

    for (const b of cpBookings) {
      const id = b.closingManagerId!;
      if (!map[id])
        map[id] = {
          id,
          name: userMap.get(id) || 'Unknown',
          bookings: 0,
          revenue: 0,
        };
      map[id].bookings++;
      map[id].revenue += Number(b.agreedPrice) || 0;
    }

    return Object.values(map)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }

  private async getTopBrokers(startDate?: Date) {
    const cpBookings = await this.prisma.booking.findMany({
      where: this.buildBookingWhere(true, startDate),
      include: {
        brokerageRecords: { select: { brokerId: true, brokerageAmount: true } },
        customer: { include: { lead: { select: { brokerId: true } } } },
      },
    });

    const map: Record<
      string,
      { id: string; name: string; bookings: number; commission: number }
    > = {};

    for (const b of cpBookings) {
      const brokerIdsForBooking = new Set<string>();
      if (b.customer?.lead?.brokerId)
        brokerIdsForBooking.add(b.customer.lead.brokerId);
      for (const br of b.brokerageRecords) {
        if (br.brokerId) brokerIdsForBooking.add(br.brokerId);
      }

      for (const brkId of brokerIdsForBooking) {
        if (!map[brkId])
          map[brkId] = { id: brkId, name: '', bookings: 0, commission: 0 };
        map[brkId].bookings++;
        // Sum commission from brokerage records
        for (const br of b.brokerageRecords) {
          if (br.brokerId === brkId) {
            map[brkId].commission += Number(br.brokerageAmount) || 0;
          }
        }
      }
    }

    if (Object.keys(map).length === 0) return [];

    const brokers = await this.prisma.broker.findMany({
      where: { id: { in: Object.keys(map) } },
      select: { id: true, name: true },
    });

    for (const broker of brokers) {
      if (map[broker.id]) {
        map[broker.id].name = broker.name;
      }
    }

    return Object.values(map)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }

  // ─── Action Items ─────────────────────────────────────────────────────────────

  private async getActionItems() {
    const [pendingApprovals, overdueCollections, highBacklogTeams] =
      await Promise.all([
        // Pending FinancialApprovals
        this.prisma.financialApproval.findMany({
          where: { status: 'PENDING' },
          orderBy: { requestedAt: 'asc' },
          take: 5,
          select: {
            id: true,
            type: true,
            title: true,
            amount: true,
            requestedAt: true,
            requestedBy: { select: { id: true, name: true, username: true } },
          },
        }),
        // Overdue collection records
        this.prisma.collectionRecord.findMany({
          where: { isOverdue: true },
          orderBy: { overdueDays: 'desc' },
          take: 5,
          select: {
            id: true,
            outstanding: true,
            overdueDays: true,
            overdueAmount: true,
            booking: {
              select: {
                bookingNumber: true,
                customer: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        // Teams with high missed follow-up counts (top 3)
        this.prisma.followUp.groupBy({
          by: ['userId'],
          where: { status: 'MISSED' },
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 3,
        }),
      ]);

    const missedUserIds = highBacklogTeams.map((t) => t.userId).filter(Boolean);
    const missedUsers =
      missedUserIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: missedUserIds } },
            select: { id: true, name: true, username: true },
          })
        : [];
    const missedUserMap = new Map(
      missedUsers.map((u) => [u.id, u.name || u.username || 'Unknown']),
    );

    const actions = [
      ...pendingApprovals.map((a) => ({
        id: `approval-${a.id}`,
        type: 'PENDING_APPROVAL' as const,
        title: `Approval: ${a.title} (${a.type})`,
        description: `Requested by ${a.requestedBy?.name || a.requestedBy?.username || 'Unknown'} — ₹${Number(a.amount || 0).toLocaleString('en-IN')}`,
        severity: 'WARNING' as const,
        date: a.requestedAt,
        meta: { approvalId: a.id, type: a.type, amount: Number(a.amount) },
      })),
      ...overdueCollections.map((c) => ({
        id: `overdue-${c.id}`,
        type: 'OVERDUE_PAYMENT' as const,
        title: `Overdue Payment: ${c.booking?.bookingNumber || 'Booking'}`,
        description: `Customer: ${c.booking?.customer?.firstName || ''} ${c.booking?.customer?.lastName || ''} — Outstanding ₹${Number(c.outstanding).toLocaleString('en-IN')} — ${c.overdueDays} days overdue`,
        severity: 'CRITICAL' as const,
        date: new Date(),
        meta: {
          collectionId: c.id,
          overdueDays: c.overdueDays,
          outstanding: Number(c.outstanding),
        },
      })),
      ...highBacklogTeams.map((t) => ({
        id: `backlog-${t.userId}`,
        type: 'HIGH_BACKLOG' as const,
        title: `High Follow-up Backlog`,
        description: `${missedUserMap.get(t.userId) || 'An employee'} has ${t._count.userId} missed follow-ups`,
        severity: 'INFO' as const,
        date: new Date(),
        meta: { userId: t.userId, missedCount: t._count.userId },
      })),
    ];

    return actions;
  }
}
