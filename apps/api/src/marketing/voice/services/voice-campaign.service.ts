// ============================================================================
// BrokerOS — Voice Campaign Service (CRUD, Drafts, Dispatch Lifecycle)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { VoiceAudienceService } from './voice-audience.service.js';
import type {
  CreateVoiceCampaignDto,
  SaveDraftVoiceCampaignDto,
  CalculateVoiceCostEstimateDto,
} from '../dto/voice.dto.js';
import { calculateVoiceCampaignCostEstimate } from '@brokeros/constants';

@Injectable()
export class VoiceCampaignService {
  private readonly logger = new Logger(VoiceCampaignService.name);
  private readonly prisma = prismaClient;

  constructor(private readonly audienceService: VoiceAudienceService) { }

  async resolveForeignKeys(dto: {
    projectId?: string | null;
    telephonyId?: string | null;
    agentPlatformId?: string | null;
  }) {
    let projectId: string | null = null;
    let telephonyId: string | null = null;
    let agentPlatformId: string | null = null;

    if (dto.projectId) {
      const proj = await this.prisma.project
        .findUnique({ where: { id: dto.projectId } })
        .catch(() => null);
      if (proj) projectId = proj.id;
    }

    if (dto.telephonyId) {
      const tel = await this.prisma.voiceTelephonyIntegration
        .findUnique({ where: { id: dto.telephonyId } })
        .catch(() => null);
      if (tel) telephonyId = tel.id;
    }

    if (dto.agentPlatformId) {
      const ag = await this.prisma.voiceAgentIntegration
        .findUnique({ where: { id: dto.agentPlatformId } })
        .catch(() => null);
      if (ag) {
        agentPlatformId = ag.id;
      } else {
        const fallbackAg = await this.prisma.voiceAgentIntegration
          .findFirst({
            where: {
              platform: dto.agentPlatformId.toUpperCase() as any,
              isActive: true,
            },
          })
          .catch(() => null);
        if (fallbackAg) agentPlatformId = fallbackAg.id;
      }
    }

    return { projectId, telephonyId, agentPlatformId };
  }

  async getProjects() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true, isCpProject: true },
      orderBy: { name: 'asc' },
    });
  }

  async getCampaigns(query?: {
    status?: string;
    projectId?: string;
    isCpCampaign?: boolean;
    page?: number;
    limit?: number;
    search?: string;
    includeDrafts?: string | boolean;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(Number(query?.limit) || 20, 100));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) {
      if (query.status !== 'ALL') {
        where.status = query.status;
      } else if (
        query?.includeDrafts !== 'true' &&
        query?.includeDrafts !== true
      ) {
        where.status = { not: 'DRAFT' };
      }
    } else if (
      query?.includeDrafts !== 'true' &&
      query?.includeDrafts !== true
    ) {
      where.status = { not: 'DRAFT' };
    }

    if (query?.projectId) where.projectId = query.projectId;
    if (query?.isCpCampaign !== undefined)
      where.isCpCampaign = query.isCpCampaign;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { scriptPrompt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.voiceCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, city: true } },
          telephony: { select: { id: true, name: true, provider: true } },
          agentIntegration: {
            select: { id: true, name: true, platform: true },
          },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.voiceCampaign.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCampaignById(id: string) {
    const campaign = await this.prisma.voiceCampaign.findUnique({
      where: { id },
      include: {
        project: true,
        telephony: true,
        agentIntegration: true,
        createdBy: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
        recipients: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
        callLogs: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Voice campaign ${id} not found`);
    }

    return campaign;
  }

  async saveDraftCampaign(
    dto: SaveDraftVoiceCampaignDto,
    userId?: string,
    existingId?: string,
  ) {
    const targetId = dto.campaignId || existingId;
    const validatedFks = await this.resolveForeignKeys({
      projectId: dto.projectId,
      telephonyId: dto.telephonyId,
      agentPlatformId: dto.agentPlatformId,
    });

    if (targetId) {
      const existing = await this.prisma.voiceCampaign.findUnique({
        where: { id: targetId },
      });
      if (existing) {
        return this.prisma.voiceCampaign.update({
          where: { id: targetId },
          data: {
            title: dto.title || existing.title,
            isCpCampaign: dto.isCpCampaign ?? existing.isCpCampaign,
            projectId:
              validatedFks.projectId !== undefined
                ? validatedFks.projectId
                : existing.projectId,
            telephonyId:
              validatedFks.telephonyId !== undefined
                ? validatedFks.telephonyId
                : existing.telephonyId,
            callerIdNumber:
              dto.callerIdNumber !== undefined
                ? dto.callerIdNumber
                : existing.callerIdNumber,
            agentPlatformId:
              validatedFks.agentPlatformId !== undefined
                ? validatedFks.agentPlatformId
                : existing.agentPlatformId,
            llmModel: dto.llmModel || existing.llmModel,
            voiceProvider: dto.voiceProvider || existing.voiceProvider,
            voiceId: dto.voiceId || existing.voiceId,
            voiceName: dto.voiceName || existing.voiceName,
            scriptPrompt:
              dto.scriptPrompt !== undefined
                ? dto.scriptPrompt
                : existing.scriptPrompt,
            firstMessage:
              dto.firstMessage !== undefined
                ? dto.firstMessage
                : existing.firstMessage,
            maxConcurrentCalls:
              dto.maxConcurrentCalls ?? existing.maxConcurrentCalls,
            retryLimit: dto.retryLimit ?? existing.retryLimit,
            callingWindowStart:
              dto.callingWindowStart !== undefined
                ? dto.callingWindowStart
                : existing.callingWindowStart,
            callingWindowEnd:
              dto.callingWindowEnd !== undefined
                ? dto.callingWindowEnd
                : existing.callingWindowEnd,
            audienceSource: dto.audienceSource || existing.audienceSource,
            audienceFilters:
              dto.audienceFilters || existing.audienceFilters || {},
            status: 'DRAFT',
          },
        });
      }
    }

    return this.prisma.voiceCampaign.create({
      data: {
        title: dto.title?.trim() || 'Untitled Voice Campaign',
        isCpCampaign: dto.isCpCampaign ?? false,
        projectId: validatedFks.projectId,
        telephonyId: validatedFks.telephonyId,
        callerIdNumber: dto.callerIdNumber || null,
        agentPlatformId: validatedFks.agentPlatformId,
        llmModel: dto.llmModel || 'gpt-4o-mini',
        voiceProvider: dto.voiceProvider || '11labs',
        voiceId: dto.voiceId || '21m00Tcm4TlvDq8ikWAM',
        voiceName: dto.voiceName || 'Rachel',
        scriptPrompt: dto.scriptPrompt || '',
        firstMessage: dto.firstMessage || null,
        maxConcurrentCalls: dto.maxConcurrentCalls ?? 5,
        retryLimit: dto.retryLimit ?? 1,
        callingWindowStart: dto.callingWindowStart || null,
        callingWindowEnd: dto.callingWindowEnd || null,
        audienceSource: dto.audienceSource || 'CRM_DATABASE',
        audienceFilters: dto.audienceFilters || {},
        createdById: userId || null,
        status: 'DRAFT',
      },
    });
  }

  async createCampaign(dto: CreateVoiceCampaignDto, userId?: string) {
    const recipients = await this.audienceService.resolveAudienceRecipients({
      audienceSource: dto.audienceSource,
      audienceFilters: dto.audienceFilters,
      csvRecipients: dto.csvRecipients,
      isCpCampaign: dto.isCpCampaign,
      projectId: dto.projectId,
    });

    if (recipients.length === 0) {
      throw new BadRequestException(
        'Cannot create a voice campaign with 0 valid recipients',
      );
    }

    const scheduledDate = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const initialStatus =
      scheduledDate && scheduledDate > new Date() ? 'SCHEDULED' : 'PROCESSING';

    const validatedFks = await this.resolveForeignKeys({
      projectId: dto.projectId,
      telephonyId: dto.telephonyId,
      agentPlatformId: dto.agentPlatformId,
    });

    const campaign = await this.prisma.$transaction(async (tx) => {
      let created: any = null;

      if (dto.campaignId) {
        const existing = await tx.voiceCampaign.findUnique({
          where: { id: dto.campaignId },
        });

        if (existing) {
          created = await tx.voiceCampaign.update({
            where: { id: dto.campaignId },
            data: {
              title: dto.title,
              isCpCampaign: dto.isCpCampaign ?? false,
              projectId: validatedFks.projectId,
              telephonyId: validatedFks.telephonyId,
              callerIdNumber: dto.callerIdNumber || null,
              agentPlatformId: validatedFks.agentPlatformId,
              llmModel: dto.llmModel,
              voiceProvider: dto.voiceProvider,
              voiceId: dto.voiceId,
              voiceName: dto.voiceName || 'Rachel',
              scriptPrompt: dto.scriptPrompt,
              firstMessage: dto.firstMessage || null,
              maxConcurrentCalls: dto.maxConcurrentCalls ?? 5,
              retryLimit: dto.retryLimit ?? 1,
              callingWindowStart: dto.callingWindowStart || null,
              callingWindowEnd: dto.callingWindowEnd || null,
              audienceSource: dto.audienceSource || 'CRM_DATABASE',
              audienceFilters: (dto.audienceFilters as any) || {},
              totalRecipients: recipients.length,
              status: initialStatus,
              scheduledAt: scheduledDate,
              startedAt: initialStatus === 'PROCESSING' ? new Date() : null,
            },
          });

          await tx.voiceRecipient.deleteMany({
            where: { campaignId: created.id },
          });
        }
      }

      if (!created) {
        created = await tx.voiceCampaign.create({
          data: {
            title: dto.title,
            isCpCampaign: dto.isCpCampaign ?? false,
            projectId: validatedFks.projectId,
            telephonyId: validatedFks.telephonyId,
            callerIdNumber: dto.callerIdNumber || null,
            agentPlatformId: validatedFks.agentPlatformId,
            llmModel: dto.llmModel,
            voiceProvider: dto.voiceProvider,
            voiceId: dto.voiceId,
            voiceName: dto.voiceName || 'Rachel',
            scriptPrompt: dto.scriptPrompt,
            firstMessage: dto.firstMessage || null,
            maxConcurrentCalls: dto.maxConcurrentCalls ?? 5,
            retryLimit: dto.retryLimit ?? 1,
            callingWindowStart: dto.callingWindowStart || null,
            callingWindowEnd: dto.callingWindowEnd || null,
            audienceSource: dto.audienceSource || 'CRM_DATABASE',
            audienceFilters: (dto.audienceFilters as any) || {},
            totalRecipients: recipients.length,
            status: initialStatus,
            scheduledAt: scheduledDate,
            startedAt: initialStatus === 'PROCESSING' ? new Date() : null,
            createdById: userId || null,
          },
        });
      }

      // Bulk create recipients
      await tx.voiceRecipient.createMany({
        data: recipients.map((r) => ({
          campaignId: created.id,
          phone: r.phone,
          name: r.name || null,
          leadId: r.leadId || null,
          source: r.source,
          status: 'QUEUED',
          mergeData: r.mergeData || {},
        })),
      });

      // Optionally save CSV recipients as CRM leads
      if (dto.saveCsvAsCrmLeads && dto.csvRecipients?.length) {
        const crmLeadsToCreate = dto.csvRecipients
          .filter((c) => {
            const p = (c.phone || c.phoneNumber || c.mobile || '').toString();
            return p.replace(/[^\d+]/g, '').length >= 8;
          })
          .map((c) => {
            const nameParts = (c.name || 'Prospect').trim().split(' ');
            const rawPhone = (
              c.phone ||
              c.phoneNumber ||
              c.mobile ||
              ''
            ).toString();
            return {
              firstName: nameParts[0] || 'Prospect',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: VoiceAudienceService.normalizePhoneNumber(rawPhone),
              temperature: c.mergeData?.temperature || 'WARM',
              status: 'NEW' as any,
              interestedProjectId: dto.projectId || null,
              budget: c.mergeData?.budget ? Number(c.mergeData.budget) : null,
              createdById: userId || null,
            };
          });

        if (crmLeadsToCreate.length > 0) {
          await tx.lead.createMany({
            data: crmLeadsToCreate,
            skipDuplicates: true,
          });
        }
      }

      return created;
    });

    // Notify workers async
    if (initialStatus === 'PROCESSING') {
      fetch('http://localhost:3334/dispatch-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      }).catch((err) => {
        this.logger.warn(
          `Failed to ping worker for voice campaign ${campaign.id}: ${err?.message}`,
        );
      });
    }

    return campaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.voiceCampaign.findUnique({
      where: { id },
    });
    if (!campaign)
      throw new NotFoundException(`Voice Campaign ${id} not found`);

    return this.prisma.$transaction(async (tx) => {
      await tx.voiceRecipient.deleteMany({
        where: { campaignId: id },
      });
      await tx.voiceCallLog.deleteMany({
        where: { campaignId: id },
      });
      return tx.voiceCampaign.delete({
        where: { id },
      });
    });
  }

  async dispatchCampaign(campaignId: string) {
    const campaign = await this.prisma.voiceCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Voice Campaign ${campaignId} not found`);
    }

    const updated = await this.prisma.voiceCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    fetch('http://localhost:3334/dispatch-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: campaign.id }),
    }).catch((err) => {
      this.logger.warn(
        `Failed to ping worker for voice campaign ${campaign.id}: ${err?.message}`,
      );
    });

    return updated;
  }

  calculateCostEstimate(dto: CalculateVoiceCostEstimateDto) {
    return calculateVoiceCampaignCostEstimate({
      telephonyProvider: dto.telephonyCarrier,
      agentPlatform: dto.agentPlatform,
      totalLeads: dto.recipientCount,
      avgDurationMinutes: dto.expectedDurationSeconds
        ? dto.expectedDurationSeconds / 60
        : undefined,
    });
  }
}
