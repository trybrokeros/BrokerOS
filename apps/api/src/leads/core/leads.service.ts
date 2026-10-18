import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { Prisma, LeadStatus, NotificationType } from '@brokeros/prisma';
import {
  uploadFileToBlob,
  fetchBlobBuffer,
  BlobBufferResult,
} from '@brokeros/storage';
import {
  CreateLeadDto,
  UpdateLeadDto,
  GetLeadsFilterDto,
} from './dto/lead.dto.js';

const SE_VISIBLE_STATUSES: LeadStatus[] = [
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_COMPLETED',
  'NEGOTIATION',
  'BOOKING',
];

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  async findAll(filters?: GetLeadsFilterDto) {
    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
    };

    if (filters?.assignedToId) {
      // IDOR check: if querying another employee's leads, verify caller is Manager or Admin
      if (
        filters.userId &&
        filters.roleId &&
        filters.assignedToId !== filters.userId
      ) {
        const callerRole = await this.prisma.role.findUnique({
          where: { id: filters.roleId },
        });
        const isManagerOrAdmin =
          callerRole?.code === 'ADMIN' ||
          callerRole?.code === 'DIRECTOR' ||
          (callerRole?.code && callerRole.code.includes('MANAGER'));

        if (!isManagerOrAdmin) {
          throw new ForbiddenException(
            'You do not have permission to access leads assigned to other employees.',
          );
        }
      }

      const assignedUser = await this.prisma.user.findUnique({
        where: { id: filters.assignedToId },
        include: { role: true },
      });
      if (assignedUser?.role?.code === 'POST_SALES') {
        where.customer = {
          bookings: {
            some: {
              assignedPostSalesId: filters.assignedToId,
              source: 'DIRECT',
            },
          },
        };
      } else {
        where.assignedUserId = filters.assignedToId;
      }
    } else if (filters?.roleId && filters?.userId) {
      const role = await this.prisma.role.findUnique({
        where: { id: filters.roleId },
      });

      if (role?.code === 'PRE_SALES') {
        where.assignedUserId = filters.userId;
      } else if (role?.code === 'PRE_SALES_MANAGER') {
        if (filters.managerUnassigned) {
          where.OR = [
            { assignedUserId: filters.userId },
            { assignedUserId: null },
          ];
        } else {
          const subordinates = await this.prisma.user.findMany({
            where: { managerId: filters.userId },
            select: { id: true },
          });
          const subordinateIds = subordinates.map((s) => s.id);
          where.assignedUserId = { in: subordinateIds };
        }
      } else if (role?.code === 'SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: filters.userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.status = { in: SE_VISIBLE_STATUSES };
        where.OR = [
          { siteVisits: { some: { salesExecId: { in: subordinateIds } } } },
          { assignedUserId: { in: subordinateIds } },
        ];
        where.NOT = [
          { status: 'BOOKING', subStatus: 'DONE' },
          { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
        ];
      } else if (role?.code === 'SALES_EXECUTIVE') {
        const assignments = await this.prisma.projectAssignment.findMany({
          where: { userId: filters.userId, isActive: true },
          select: { projectId: true },
        });
        const projectIds = assignments.map((a) => a.projectId);

        where.status = { in: SE_VISIBLE_STATUSES };
        where.OR = [
          { siteVisits: { some: { projectId: { in: projectIds } } } },
          { assignedUserId: filters.userId },
        ];
        where.NOT = [
          { status: 'BOOKING', subStatus: 'DONE' },
          { customer: { bookings: { some: { status: 'CONFIRMED' } } } },
        ];
      } else if (role?.code === 'CLOSING_MANAGER') {
        where.OR = [
          { createdById: filters.userId },
          { assignedUserId: filters.userId },
        ];
      } else if (role?.code === 'SOURCING_MANAGER') {
        where.OR = [
          { createdById: filters.userId },
          { broker: { sourcingManagerId: filters.userId } },
        ];
      } else if (role?.code === 'CHANNEL_PARTNER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: filters.userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { createdById: { in: subordinateIds } },
          { assignedUserId: { in: subordinateIds } },
          { broker: { sourcingManagerId: { in: subordinateIds } } },
        ];
      } else if (role?.code === 'POST_SALES') {
        where.customer = {
          bookings: {
            some: { assignedPostSalesId: filters.userId, source: 'DIRECT' },
          },
        };
      } else if (role?.code === 'POST_SALES_MANAGER') {
        where.customer = { bookings: { some: { source: 'DIRECT' } } };
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.followUpDate) {
      const date = new Date(filters.followUpDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        where.nextFollowUpDate = { gte: date, lt: nextDay };
      }
    }

    if (filters?.siteVisitDate) {
      const svDate = new Date(filters.siteVisitDate + 'T00:00:00');
      if (!isNaN(svDate.getTime())) {
        const svNextDay = new Date(svDate);
        svNextDay.setDate(svDate.getDate() + 1);
        where.siteVisits = {
          some: {
            scheduledDate: { gte: svDate, lt: svNextDay },
          },
        };
      }
    }

    if (filters?.scoreRange) {
      if (filters.scoreRange === '0-60') {
        where.score = { gte: 0, lte: 60 };
      } else if (filters.scoreRange === '60-80') {
        where.score = { gt: 60, lte: 80 };
      } else if (filters.scoreRange === '80-100') {
        where.score = { gt: 80, lte: 100 };
      }
    }

    if (filters?.isCpProject !== undefined) {
      where.interestedProject = { isCpProject: filters.isCpProject };
    }

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        subStatus: true,
        score: true,
        lastContactDate: true,
        nextFollowUpDate: true,
        createdAt: true,
        assignedUser: {
          select: { name: true, username: true },
        },
        interestedProject: {
          select: { id: true, name: true, slug: true },
        },
        siteVisits: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
          select: {
            scheduledDate: true,
            status: true,
            completedAt: true,
            projectId: true,
            salesExec: { select: { name: true, username: true } },
          },
        },
        followUps: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
          select: { scheduledDate: true, status: true },
        },
        customer: {
          select: {
            bookings: {
              select: {
                unit: {
                  select: {
                    constructionStatus: true,
                    possessionTimeline: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return leads.map((lead) => {
      const latestSV = lead.siteVisits.length > 0 ? lead.siteVisits[0] : null;
      const latestFollowUp =
        lead.followUps.length > 0 ? lead.followUps[0] : null;
      return {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        status: lead.status,
        subStatus: lead.subStatus,
        score: lead.score,
        lastContactDate: lead.lastContactDate,
        nextFollowUpDate:
          lead.nextFollowUpDate || latestFollowUp?.scheduledDate || null,
        createdAt: lead.createdAt,
        assignedUser: lead.assignedUser,
        interestedProject: (lead as any).interestedProject || null,
        latestSiteVisit: latestSV,
        siteVisitScheduledDate: latestSV?.scheduledDate ?? null,
        siteVisitCompletedDate: latestSV?.completedAt ?? null,
        latestFollowUp: latestFollowUp,
        processionStatus:
          lead.customer?.bookings?.[0]?.unit?.constructionStatus || null,
        processionTimeline:
          lead.customer?.bookings?.[0]?.unit?.possessionTimeline || null,
      };
    });
  }

  async findOne(id: string, userId?: string, roleId?: string) {
    const where: any = { id, deletedAt: null };

    if (roleId && userId) {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (role?.code === 'PRE_SALES') {
        where.assignedUserId = userId;
      } else if (role?.code === 'PRE_SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.assignedUserId = { in: subordinateIds };
      } else if (role?.code === 'SALES_EXECUTIVE') {
        where.OR = [
          { assignedUserId: userId },
          { siteVisits: { some: { salesExecId: userId } } },
          { customer: { bookings: { some: { salesExecId: userId } } } },
        ];
      } else if (role?.code === 'SALES_MANAGER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { siteVisits: { some: { salesExecId: { in: subordinateIds } } } },
          {
            customer: {
              bookings: { some: { salesExecId: { in: subordinateIds } } },
            },
          },
        ];
      } else if (role?.code === 'CLOSING_MANAGER') {
        where.OR = [{ createdById: userId }, { assignedUserId: userId }];
      } else if (role?.code === 'SOURCING_MANAGER') {
        where.OR = [
          { createdById: userId },
          { broker: { sourcingManagerId: userId } },
        ];
      } else if (role?.code === 'CHANNEL_PARTNER') {
        const subordinates = await this.prisma.user.findMany({
          where: { managerId: userId },
          select: { id: true },
        });
        const subordinateIds = subordinates.map((s) => s.id);
        where.OR = [
          { createdById: { in: subordinateIds } },
          { assignedUserId: { in: subordinateIds } },
          { broker: { sourcingManagerId: { in: subordinateIds } } },
        ];
      } else if (role?.code === 'POST_SALES') {
        where.customer = {
          bookings: { some: { assignedPostSalesId: userId, source: 'DIRECT' } },
        };
      } else if (role?.code === 'POST_SALES_MANAGER') {
        where.customer = { bookings: { some: { source: 'DIRECT' } } };
      }
    }

    const lead = await this.prisma.lead.findFirst({
      where: where as any,
      include: {
        source: true,
        interestedProject: true,
        interestedTower: true,
        interestedUnit: true,
        broker: true,
        assignedUser: true,
        customer: {
          include: {
            bookings: {
              include: { unit: true },
            },
          },
        },
        siteVisits: {
          orderBy: { scheduledDate: 'desc' },
          include: { project: true },
        },
        followUps: {
          orderBy: { scheduledDate: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { username: true, displayUsername: true } },
          },
        },
        callRecords: {
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (lead.callRecords) {
      lead.callRecords = lead.callRecords.map((cr) => {
        if (cr.recordingUrl && cr.recordingUrl.includes('vercel-storage.com')) {
          cr.recordingUrl = `/api/leads/call-records/${cr.id}/audio`;
        }
        return cr;
      });
    }

    const result: any = lead;
    result.processionStatus =
      lead.customer?.bookings?.[0]?.unit?.constructionStatus || null;
    result.processionTimeline =
      lead.customer?.bookings?.[0]?.unit?.possessionTimeline || null;

    return result;
  }

  // ---------------------------------------------------------------------------
  // Mutations & Management
  // ---------------------------------------------------------------------------

  async create(data: CreateLeadDto, userId?: string) {
    let sourceId = data.sourceId;
    if (!sourceId && data.source) {
      const source = await this.prisma.leadSource.findFirst({
        where: { name: { equals: data.source, mode: 'insensitive' } },
      });
      if (source) sourceId = source.id;
    }

    return this.prisma.lead.create({
      data: {
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName,
        phone: String(data.phone),
        email: data.email,
        status: 'NEW',
        assignedUserId: data.assignedUserId || userId,
        createdById: userId,
        sourceId: sourceId,
        interestedProjectId: data.interestedProjectId,
        interestedTowerId: data.interestedTowerId,
        interestedUnitId: data.interestedUnitId,
        brokerId: data.brokerId,
        preferredLocation: data.preferredLocation || null,
        budget: data.budget ? Number(data.budget) : null,
        requirements: data.requirements || null,
      },
      include: {
        source: true,
        interestedProject: true,
        broker: true,
      },
    });
  }

  async bulkCreate(leads: CreateLeadDto[], managerId: string) {
    const sources = await this.prisma.leadSource.findMany();
    const projects = await this.prisma.project.findMany();

    const data = leads.map((lead) => {
      let sourceId: string | null = null;
      if (lead.source) {
        const match = sources.find(
          (s) => s.name.toLowerCase() === String(lead.source).toLowerCase(),
        );
        if (match) sourceId = match.id;
      }

      let interestedProjectId: string | null = null;
      if (lead.project) {
        const match = projects.find(
          (p) => p.name.toLowerCase() === String(lead.project).toLowerCase(),
        );
        if (match) interestedProjectId = match.id;
      }

      return {
        firstName: lead.firstName || 'Unknown',
        lastName: lead.lastName,
        phone: String(lead.phone),
        email: lead.email,
        status: LeadStatus.NEW,
        assignedUserId: managerId,
        createdById: managerId,
        sourceId: sourceId,
        interestedProjectId: interestedProjectId,
        preferredLocation: lead.preferredLocation || null,
        budget: lead.budget ? Number(lead.budget) : null,
        requirements: lead.requirements || null,
      };
    });

    const result = await this.prisma.lead.createMany({
      data,
      skipDuplicates: true,
    });

    if (result.count > 0 && managerId) {
      await this.notificationsService.createNotification({
        userId: managerId,
        type: NotificationType.LEAD_ASSIGNED,
        title: `You have ${result.count} new leads assigned.`,
        body: 'Tap to view your newly assigned leads.',
        metadata: { count: result.count },
      });
    }

    return { success: true, count: result.count };
  }

  async assignLeads(
    leadIds: string[],
    managerId: string,
    targetUserId?: string,
    roundRobin?: boolean,
  ) {
    if (roundRobin) {
      const subordinates = await this.prisma.user.findMany({
        where: { managerId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      if (subordinates.length === 0) {
        throw new Error('No active subordinates found to assign leads to.');
      }

      let assignedCount = 0;
      const userAssignmentCount: Record<string, number> = {};

      for (let i = 0; i < leadIds.length; i++) {
        const userId = subordinates[i % subordinates.length].id;
        await this.prisma.lead.update({
          where: { id: leadIds[i] },
          data: { assignedUserId: userId },
        });
        assignedCount++;
        userAssignmentCount[userId] = (userAssignmentCount[userId] || 0) + 1;
      }

      for (const [userId, count] of Object.entries(userAssignmentCount)) {
        await this.notificationsService.createNotification({
          userId,
          type: NotificationType.LEAD_ASSIGNED,
          title: `You have ${count} new leads assigned.`,
          body: 'Tap to view your newly assigned leads.',
          metadata: { count },
        });
      }

      return { success: true, assignedCount };
    } else if (targetUserId) {
      const result = await this.prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { assignedUserId: targetUserId },
      });

      if (result.count > 0) {
        await this.notificationsService.createNotification({
          userId: targetUserId,
          type: NotificationType.LEAD_ASSIGNED,
          title: `You have ${result.count} new leads assigned.`,
          body: 'Tap to view your newly assigned leads.',
          metadata: { count: result.count },
        });
      }

      return { success: true, assignedCount: result.count };
    }

    throw new Error('Must provide either targetUserId or roundRobin flag.');
  }

  async updateStatus(id: string, status: LeadStatus, subStatus?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    const data: any = { status };
    if (subStatus) data.subStatus = subStatus;

    return this.prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id },
        data,
      });

      if (status === 'HANDOVER' && subStatus === 'DONE') {
        const booking = await tx.booking.findFirst({
          where: {
            customer: { leadId: id },
            status: { in: ['DOCUMENTATION_PENDING', 'CONFIRMED'] },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (booking && booking.unitId) {
          await tx.unit.update({
            where: { id: booking.unitId },
            data: { status: 'SOLD' },
          });
        }
      }

      return updatedLead;
    });
  }

  async update(id: string, data: UpdateLeadDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    return this.prisma.lead.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        preferredLocation: data.preferredLocation,
        requirements: data.requirements,
        budget: data.budget,
        sourceId: data.sourceId,
        subStatus: data.subStatus,
        interestedProjectId: data.interestedProjectId,
        temperature: data.temperature,
        lastContactDate: data.lastContactDate
          ? new Date(data.lastContactDate)
          : undefined,
        nextFollowUpDate: data.nextFollowUpDate
          ? new Date(data.nextFollowUpDate)
          : undefined,
      },
      include: {
        source: true,
        interestedProject: true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Media & Storage
  // ---------------------------------------------------------------------------

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);

    const url = await uploadFileToBlob(
      file.buffer,
      `avatars/${id}-${file.originalname}`,
    );

    return this.prisma.lead.update({
      where: { id },
      data: {
        avatar: url,
      },
    });
  }

  async getAvatarStream(id: string): Promise<BlobBufferResult | null> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: { avatar: true },
    });
    if (!lead || !lead.avatar) {
      return null;
    }

    return fetchBlobBuffer(lead.avatar);
  }
}
