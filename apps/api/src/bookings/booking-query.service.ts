import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';

@Injectable()
export class BookingQueryService {
  constructor(private prisma: PrismaService) {}

  async getBooking(leadId: string, userId?: string, roleId?: string) {
    if (userId && roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      const roleCode = role?.code || '';

      // Admins and Directors have company-wide access
      if (roleCode !== 'ADMIN' && roleCode !== 'DIRECTOR') {
        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
          select: { assignedUserId: true, createdById: true },
        });

        const existingBooking = await this.prisma.booking.findFirst({
          where: { customer: { leadId } },
          select: {
            salesExecId: true,
            closingManagerId: true,
            assignedPostSalesId: true,
            source: true,
          },
        });

        const isDirectOwner =
          lead?.assignedUserId === userId ||
          lead?.createdById === userId ||
          existingBooking?.salesExecId === userId ||
          existingBooking?.closingManagerId === userId ||
          existingBooking?.assignedPostSalesId === userId;

        let isAuthorizedManager = false;
        if (!isDirectOwner && roleCode.includes('MANAGER')) {
          const subordinates = await this.prisma.user.findMany({
            where: { managerId: userId },
            select: { id: true },
          });
          const subIds = new Set(subordinates.map((s) => s.id));
          if (
            (lead?.assignedUserId && subIds.has(lead.assignedUserId)) ||
            (existingBooking?.salesExecId &&
              subIds.has(existingBooking.salesExecId)) ||
            (existingBooking?.closingManagerId &&
              subIds.has(existingBooking.closingManagerId))
          ) {
            isAuthorizedManager = true;
          }
        }

        if (!isDirectOwner && !isAuthorizedManager) {
          throw new ForbiddenException(
            'You do not have authorization to access this booking record.',
          );
        }
      }
    }

    const booking = await this.prisma.booking.findFirst({
      where: { customer: { leadId } },
      include: {
        unit: true,
        documents: true,
        notes: true,
        loanCase: true,
        agreement: true,
        possession: true,
      },
    });

    if (!booking) return null;

    const documents = booking.documents.map((doc) => ({
      ...doc,
      url: doc.fileUrl.includes('vercel-storage.com')
        ? `/api/leads/booking-documents/${doc.id}`
        : doc.fileUrl,
      name: doc.title,
      type: doc.type,
    }));

    // Find the note containing payment details if it exists
    let extraData = {};
    if (booking.notes) {
      for (const note of booking.notes) {
        try {
          const parsed = JSON.parse(note.content);
          if (parsed && parsed.paymentMode) {
            extraData = parsed;
            break;
          }
        } catch (e) {}
      }
    }

    return {
      id: booking.id,
      unitDescription: booking.unitId ? `Unit ${booking.unit.unitNumber}` : '',
      agreedPrice: booking.agreedPrice,
      bookingAmount: booking.tokenAmount,
      paymentMode: (extraData as Record<string, any>).paymentMode,
      transactionRef: (extraData as Record<string, any>).transactionRef,
      loanRequired: (extraData as Record<string, any>).loanRequired || false,
      remarks:
        booking.cancelReason || (extraData as Record<string, any>).remarks,
      documents,
      status: booking.status,
      createdAt: booking.createdAt,
      loanCase: booking.loanCase,
      agreement: booking.agreement,
      possession: booking.possession,
    };
  }

  async getAllBookings(userId: string, roleId: string) {
    if (!roleId || !userId) {
      return [];
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return [];
    }
    const roleCode = role.code;

    // Sales Executive
    if (roleCode === 'SALES_EXECUTIVE') {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          salesExecId: userId,
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Sales Manager
    if (roleCode === 'SALES_MANAGER') {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          source: 'DIRECT', // only sees brokerage bookings
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
          salesExec: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Post Sales
    if (roleCode === 'POST_SALES') {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          assignedPostSalesId: userId,
          source: 'DIRECT', // only internal brokerage bookings
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
          salesExec: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Post Sales Manager
    if (roleCode === 'POST_SALES_MANAGER') {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          source: 'DIRECT', // only internal brokerage bookings
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
          salesExec: true,
          assignedPostSales: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Closing Manager / Sourcing Manager (CP Side)
    if (
      roleCode === 'CLOSING_MANAGER' ||
      roleCode === 'SOURCING_MANAGER' ||
      roleCode === 'CHANNEL_PARTNER'
    ) {
      return this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          source: 'CHANNEL_PARTNER',
        },
        include: {
          customer: { include: { lead: true } },
          unit: true,
          closingManager: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Admins or others
    return this.prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        customer: { include: { lead: true } },
        unit: true,
        salesExec: true,
        closingManager: true,
        assignedPostSales: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
