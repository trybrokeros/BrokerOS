import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Injectable()
export class BusinessManagerAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(period?: string) {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = startDate ? { gte: startDate, lte: now } : undefined;

    // We will separate CP and Brokerage using `isCpProject`
    const bookingWhere: any = { status: { not: 'CANCELLED' } };
    if (dateFilter) {
      bookingWhere.bookingDate = dateFilter;
    }

    const bookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      include: {
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        },
        customer: { include: { lead: true } },
        loanCase: true,
        agreement: true,
        possession: true,
      },
    });

    // Lead fetching
    const leadsWhere: any = { deletedAt: null };
    if (dateFilter) {
      leadsWhere.createdAt = dateFilter;
    }

    const leads = await this.prisma.lead.findMany({
      where: leadsWhere,
      include: {
        interestedProject: true,
        source: true,
      },
    });

    // 1. Revenue over time (layered: brokerage vs cp)
    const revenueTimeMap = new Map<
      string,
      { date: string; brokerage: number; cp: number }
    >();
    for (const b of bookings) {
      const d = new Date(b.bookingDate);
      let key: string;
      if (period === 'weekly')
        key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      else if (period === 'monthly') key = `Week ${Math.ceil(d.getDate() / 7)}`;
      else
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueTimeMap.has(key)) {
        revenueTimeMap.set(key, { date: key, brokerage: 0, cp: 0 });
      }

      const r = revenueTimeMap.get(key)!;
      const isCp = b.unit?.floor?.tower?.project?.isCpProject;
      const price = Number(b.agreedPrice) || 0;

      if (isCp) {
        r.cp += price;
      } else {
        r.brokerage += price;
      }
    }
    const revenueTrend = Array.from(revenueTimeMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // 2. Lead pipeline funnel (brokerage vs cp comparison)
    const leadPipeline = {
      brokerage: {
        NEW: 0,
        CONTACTED: 0,
        INTERESTED: 0,
        QUALIFIED: 0,
        SITE_VISIT_SCHEDULED: 0,
        NEGOTIATION: 0,
        BOOKING: 0,
      },
      cp: {
        NEW: 0,
        CONTACTED: 0,
        INTERESTED: 0,
        QUALIFIED: 0,
        SITE_VISIT_SCHEDULED: 0,
        NEGOTIATION: 0,
        BOOKING: 0,
      },
    };

    for (const l of leads) {
      // Determine if lead is CP or Brokerage
      // Either by assigned project being CP, source being CHANNEL_PARTNER, or assigned broker
      const isCp =
        Boolean(l.interestedProject?.isCpProject) ||
        l.source?.type === 'CHANNEL_PARTNER' ||
        Boolean(l.brokerId);
      const target = isCp ? leadPipeline.cp : leadPipeline.brokerage;

      if (l.status === 'SITE_VISIT_COMPLETED') {
        target.SITE_VISIT_SCHEDULED++;
      } else if (target.hasOwnProperty(l.status)) {
        (target as any)[l.status]++;
      }
    }

    // 3. Lead-to-booking conversion rate per month (grouped by month string)
    const conversionTimeMap = new Map<
      string,
      { month: string; leads: number; bookings: number }
    >();

    // Group all leads (not just date filtered) to see overall conversion if needed, but we stick to the period
    for (const l of leads) {
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!conversionTimeMap.has(key))
        conversionTimeMap.set(key, { month: key, leads: 0, bookings: 0 });
      conversionTimeMap.get(key)!.leads++;
    }
    for (const b of bookings) {
      const d = new Date(b.bookingDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!conversionTimeMap.has(key))
        conversionTimeMap.set(key, { month: key, leads: 0, bookings: 0 });
      conversionTimeMap.get(key)!.bookings++;
    }
    const leadConversionTrend = Array.from(conversionTimeMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month),
    );

    // 4. Booking funnel (Brokerage vs CP)
    // Confirmed -> Documentation (No Loan/Agreement/Possession) -> Loan/Agreement -> Possession -> Handover
    const bookingFunnel = {
      brokerage: {
        confirmed: 0,
        documentation: 0,
        loanAgreement: 0,
        possession: 0,
        handover: 0,
      },
      cp: {
        confirmed: 0,
        documentation: 0,
        loanAgreement: 0,
        possession: 0,
        handover: 0,
      },
    };

    for (const b of bookings) {
      const isCp = b.unit?.floor?.tower?.project?.isCpProject;
      const target = isCp ? bookingFunnel.cp : bookingFunnel.brokerage;

      target.confirmed++;
      const hasLoanOrAgreement = !!b.loanCase || !!b.agreement;
      const hasPossession = !!b.possession;
      const isHandedOver =
        b.possession?.status === 'HANDED_OVER' ||
        b.status === 'HANDOVER_COMPLETED';

      if (b.status !== 'CONFIRMED' || hasLoanOrAgreement || hasPossession)
        target.documentation++;
      if (hasLoanOrAgreement || hasPossession) target.loanAgreement++;
      if (hasPossession) target.possession++;
      if (isHandedOver) target.handover++;
    }

    // 5. Payment collection efficiency
    const collectionRecordsWhere: any = {};
    if (dateFilter) {
      collectionRecordsWhere.createdAt = dateFilter; // approximation for period
    }
    const collectionRecords = await this.prisma.collectionRecord.findMany({
      where: collectionRecordsWhere,
    });

    const paymentEfficiency = {
      totalPayable: 0,
      totalCollected: 0,
      outstanding: 0,
      overdue: 0,
    };

    for (const cr of collectionRecords) {
      paymentEfficiency.totalPayable += Number(cr.totalPayable) || 0;
      paymentEfficiency.totalCollected += Number(cr.totalCollected) || 0;
      paymentEfficiency.outstanding += Number(cr.outstanding) || 0;
      paymentEfficiency.overdue += Number(cr.overdueAmount) || 0;
    }

    // 6. Expense vs Revenue trend
    const expenseWhere: any = {
      approvalStatus: 'APPROVED',
    };
    if (dateFilter) {
      expenseWhere.expenseDate = dateFilter;
    }
    const expenses = await this.prisma.expense.findMany({
      where: expenseWhere,
    });

    const expenseRevenueTimeMap = new Map<
      string,
      { month: string; revenue: number; expense: number }
    >();

    // Revenue from bookings
    for (const b of bookings) {
      const d = new Date(b.bookingDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!expenseRevenueTimeMap.has(key))
        expenseRevenueTimeMap.set(key, { month: key, revenue: 0, expense: 0 });
      expenseRevenueTimeMap.get(key)!.revenue += Number(b.agreedPrice) || 0;
    }

    // Expenses
    for (const ex of expenses) {
      const d = new Date(ex.expenseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!expenseRevenueTimeMap.has(key))
        expenseRevenueTimeMap.set(key, { month: key, revenue: 0, expense: 0 });
      expenseRevenueTimeMap.get(key)!.expense += Number(ex.amount) || 0;
    }

    const expenseRevenueTrend = Array.from(expenseRevenueTimeMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month),
    );

    return {
      revenueTrend,
      leadPipeline,
      leadConversionTrend,
      bookingFunnel,
      paymentEfficiency,
      expenseRevenueTrend,
    };
  }
}
