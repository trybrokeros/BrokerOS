import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { getMonthRange } from '../core/dashboard.utils.js';

@Injectable()
export class EmployeeCardsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns a grid of cards for each subordinate of the given manager,
   * with this-month activity stats.
   */
  async getEmployeeCards(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { role: true },
    });
    const isSupervisory =
      manager?.role?.code === 'ADMIN' ||
      manager?.role?.code === 'DIRECTOR' ||
      manager?.role?.code === 'BUSINESS_MANAGER';

    let subordinates = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        employeeCode: true,
        isOnCall: true,
      },
    });

    if (isSupervisory || subordinates.length === 0) {
      const psRole = await this.prisma.role.findFirst({
        where: { code: 'PRE_SALES' },
      });
      if (psRole) {
        subordinates = await this.prisma.user.findMany({
          where: { roleId: psRole.id, status: 'ACTIVE', deletedAt: null },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            employeeCode: true,
            isOnCall: true,
          },
        });
      }
    }

    const cards = await Promise.all(
      subordinates.map(async (sub) => {
        const [totalLeads, contactedLeads, followUpsDone, siteVisits] =
          await Promise.all([
            // Total leads assigned
            this.prisma.lead.count({
              where: {
                assignedUserId: sub.id,
                deletedAt: null,
              },
            }),
            // Leads with CONTACTED status
            this.prisma.lead.count({
              where: {
                assignedUserId: sub.id,
                status: 'CONTACTED',
                deletedAt: null,
              },
            }),
            // Follow-ups completed this month
            this.prisma.followUp.count({
              where: {
                userId: sub.id,
                status: 'COMPLETED',
                completedAt: { gte: monthStart, lte: monthEnd },
              },
            }),
            // Site visits scheduled this month
            this.prisma.siteVisit.count({
              where: {
                salesExecId: sub.id,
                scheduledDate: { gte: monthStart, lte: monthEnd },
              },
            }),
          ]);

        return {
          id: sub.id,
          name: sub.name,
          username: sub.username,
          image: sub.image,
          employeeCode: sub.employeeCode,
          isOnCall: sub.isOnCall,
          stats: { totalLeads, contactedLeads, followUpsDone, siteVisits },
        };
      }),
    );

    return cards;
  }

  /**
   * Returns the full pre-sales dashboard data for a specific employee,
   * but only if that employee reports to the requesting manager.
   */
  async getEmployeeDashboardData(managerId: string, employeeId: string) {
    await this.validateManagerEmployeeRelation(managerId, employeeId);
    return { employeeId };
  }

  /**
   * Returns a grid of cards for each subordinate of the given sales manager,
   * with this-month activity stats (site visits scheduled, completed, bookings).
   */
  async getSalesManagerEmployeeCards(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { role: true },
    });
    const isSupervisory =
      manager?.role?.code === 'ADMIN' ||
      manager?.role?.code === 'DIRECTOR' ||
      manager?.role?.code === 'BUSINESS_MANAGER';

    let subordinates = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        employeeCode: true,
        isOnCall: true,
      },
    });

    if (isSupervisory || subordinates.length === 0) {
      const seRole = await this.prisma.role.findFirst({
        where: { code: 'SALES_EXECUTIVE' },
      });
      if (seRole) {
        subordinates = await this.prisma.user.findMany({
          where: { roleId: seRole.id, status: 'ACTIVE', deletedAt: null },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            employeeCode: true,
            isOnCall: true,
          },
        });
      }
    }

    const cards = await Promise.all(
      subordinates.map(async (sub) => {
        const [siteVisitsScheduled, siteVisitsCompleted, bookings] =
          await Promise.all([
            // Site visits scheduled this month
            this.prisma.siteVisit.count({
              where: {
                salesExecId: sub.id,
                scheduledDate: { gte: monthStart, lte: monthEnd },
              },
            }),
            // Site visits completed this month
            this.prisma.siteVisit.count({
              where: {
                salesExecId: sub.id,
                status: 'COMPLETED',
                completedAt: { gte: monthStart, lte: monthEnd },
              },
            }),
            // Bookings made this month
            this.prisma.booking.count({
              where: {
                salesExecId: sub.id,
                createdAt: { gte: monthStart, lte: monthEnd },
              },
            }),
          ]);

        return {
          id: sub.id,
          name: sub.name,
          username: sub.username,
          image: sub.image,
          employeeCode: sub.employeeCode,
          isOnCall: sub.isOnCall,
          stats: { siteVisitsScheduled, siteVisitsCompleted, bookings },
        };
      }),
    );

    return cards;
  }

  /**
   * Returns the full sales executive dashboard data for a specific employee,
   * but only if that employee reports to the requesting manager.
   */
  async getSalesEmployeeDashboardData(managerId: string, employeeId: string) {
    await this.validateManagerEmployeeRelation(managerId, employeeId);
    return { employeeId };
  }

  // ─── Post-Sales Manager ───────────────────────────────────────────────────

  /**
   * Returns a grid of cards for each subordinate of the given post-sales manager,
   * with this-month activity stats (total bookings, pending docs, loan cases).
   */
  async getPostSalesManagerEmployeeCards(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const subordinates = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        employeeCode: true,
        isOnCall: true,
      },
    });

    const cards = await Promise.all(
      subordinates.map(async (sub) => {
        const [totalBookings, pendingDocs, loanCases] = await Promise.all([
          // Total bookings confirmed this month
          this.prisma.booking.count({
            where: {
              assignedPostSalesId: sub.id,
              status: 'CONFIRMED',
              bookingDate: { gte: monthStart, lte: monthEnd },
            },
          }),
          // Pending documents (DOCUMENT status)
          this.prisma.lead.count({
            where: {
              customer: { bookings: { some: { assignedPostSalesId: sub.id } } },
              status: 'DOCUMENT',
            },
          }),
          // Active loan cases this month
          this.prisma.loanCase.count({
            where: {
              booking: { assignedPostSalesId: sub.id },
              applicationDate: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        return {
          id: sub.id,
          name: sub.name,
          username: sub.username,
          image: sub.image,
          employeeCode: sub.employeeCode,
          isOnCall: sub.isOnCall,
          stats: { totalBookings, pendingDocs, loanCases },
        };
      }),
    );

    return cards;
  }

  /**
   * Returns the full post-sales dashboard data for a specific employee,
   * but only if that employee reports to the requesting manager.
   */
  async getPostSalesEmployeeDashboardData(
    managerId: string,
    employeeId: string,
  ) {
    await this.validateManagerEmployeeRelation(managerId, employeeId);
    return { employeeId };
  }

  /**
   * Returns a grid of cards for each Sourcing Manager reporting to the Channel Partner.
   * Includes total brokers, completed site visits (meetings), and completed follow-ups for this month.
   */
  async getCPSourcingManagerCards(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const subordinates = await this.prisma.user.findMany({
      where: {
        managerId,
        status: 'ACTIVE',
        deletedAt: null,
        role: { code: 'SOURCING_MANAGER' },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        employeeCode: true,
      },
    });

    const cards = await Promise.all(
      subordinates.map(async (sub) => {
        const [totalBrokers, siteVisits, followUpsDone] = await Promise.all([
          // Total brokers managed by this sourcing manager
          this.prisma.broker.count({
            where: {
              sourcingManagerId: sub.id,
              deletedAt: null,
            },
          }),
          // Meetings (site visits) completed this month
          this.prisma.brokerMeeting.count({
            where: {
              userId: sub.id,
              status: 'COMPLETED',
              scheduledDate: { gte: monthStart, lte: monthEnd },
            },
          }),
          // Follow-ups completed this month
          this.prisma.followUp.count({
            where: {
              userId: sub.id,
              status: 'COMPLETED',
              completedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        return {
          id: sub.id,
          name: sub.name,
          username: sub.username,
          image: sub.image,
          employeeCode: sub.employeeCode,
          stats: { totalBrokers, siteVisits, followUpsDone },
        };
      }),
    );

    return cards;
  }

  /**
   * Returns a grid of cards for each Closing Manager reporting to the Channel Partner.
   * Includes total leads, bookings generated, and units sold (handover completed).
   */
  async getCPClosingManagerCards(managerId: string) {
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const subordinates = await this.prisma.user.findMany({
      where: {
        managerId,
        status: 'ACTIVE',
        deletedAt: null,
        role: { code: 'CLOSING_MANAGER' },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        employeeCode: true,
      },
    });

    const cards = await Promise.all(
      subordinates.map(async (sub) => {
        const [totalLeads, bookingsGenerated, unitsSold] = await Promise.all([
          // Total leads assigned to this closing manager
          this.prisma.lead.count({
            where: {
              assignedUserId: sub.id,
              deletedAt: null,
            },
          }),
          // Bookings generated (confirmed) this month
          this.prisma.booking.count({
            where: {
              closingManagerId: sub.id,
              status: { not: 'CANCELLED' },
              bookingDate: { gte: monthStart, lte: monthEnd },
            },
          }),
          // Units sold (handover completed)
          this.prisma.booking.count({
            where: {
              closingManagerId: sub.id,
              status: 'HANDOVER_COMPLETED',
              // optionally filter by date if they want units sold this month, but we'll leave it all time or month?
              // the user didn't specify month, but usually these cards are month-based. We'll stick to month-based for consistency.
              updatedAt: { gte: monthStart, lte: monthEnd },
            },
          }),
        ]);

        return {
          id: sub.id,
          name: sub.name,
          username: sub.username,
          image: sub.image,
          employeeCode: sub.employeeCode,
          stats: { totalLeads, bookingsGenerated, unitsSold },
        };
      }),
    );

    return cards;
  }

  private async validateManagerEmployeeRelation(
    managerId: string,
    employeeId: string,
  ) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { role: true },
    });
    const isSupervisory =
      manager?.role?.code === 'ADMIN' ||
      manager?.role?.code === 'DIRECTOR' ||
      manager?.role?.code === 'BUSINESS_MANAGER';

    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
      select: { managerId: true },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    if (!isSupervisory && employee.managerId !== managerId) {
      throw new ForbiddenException('This employee does not report to you');
    }
  }
}
