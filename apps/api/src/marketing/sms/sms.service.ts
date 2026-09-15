import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import type {
  ISmsMarketingProvider,
  SmsAudienceEstimationResult,
  SmsCampaignAnalyticsSummary,
  SmsPreFlightCostSummary,
  SmsWebhookEvent,
} from '@brokeros/types';
import {
  SMS_PROVIDER_PRICING_ESTIMATES,
  calculateSmsSegments,
} from '@brokeros/constants';
import {
  CreateSmsCampaignDto,
  SaveDraftSmsCampaignDto,
  PreviewSmsAudienceDto,
  SendTestSmsDto,
  ConnectSmsIntegrationDto,
  AddSenderNumberDto,
  UpdateSenderNumberDto,
  CalculateSmsCostEstimateDto,
  BulkAssignSmsLeadsDto,
  ExportSmsLeadsDto,
} from './dto/sms.dto.js';
import { SmsAudienceService } from './services/sms-audience.service.js';
import { SmsAnalyticsService } from './services/sms-analytics.service.js';
import { SmsIntegrationsService } from './services/sms-integrations.service.js';
import { SmsTrackingService } from './services/sms-tracking.service.js';

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: SmsAudienceService,
    private readonly analyticsService: SmsAnalyticsService,
    private readonly integrationsService: SmsIntegrationsService,
    private readonly trackingService: SmsTrackingService,
  ) { }

  // ── FACADE DELEGATIONS ──

  getAdapter(providerType: string): ISmsMarketingProvider {
    return this.integrationsService.getAdapter(providerType);
  }

  async previewAudience(
    dto: PreviewSmsAudienceDto,
  ): Promise<SmsAudienceEstimationResult> {
    return this.audienceService.previewAudience(dto);
  }

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    return this.audienceService.promoteCsvRecipientToLead(recipientId, userId);
  }

  async bulkAssignRecipientsToCrm(dto: BulkAssignSmsLeadsDto, userId?: string) {
    return this.audienceService.bulkAssignRecipientsToCrm(dto, userId);
  }

  async getExportLeadsData(dto: ExportSmsLeadsDto) {
    return this.audienceService.getExportLeadsData(dto);
  }

  async getCampaignAnalytics(
    campaignId: string,
  ): Promise<SmsCampaignAnalyticsSummary> {
    return this.analyticsService.getCampaignAnalytics(campaignId);
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      engagement?: string;
      crmStatus?: string;
    },
  ) {
    return this.analyticsService.getCampaignRecipients(campaignId, query);
  }

  async sendTestSms(dto: SendTestSmsDto) {
    return this.integrationsService.sendTestSms(dto);
  }

  async listIntegrations() {
    return this.integrationsService.listIntegrations();
  }

  async connectIntegration(dto: ConnectSmsIntegrationDto) {
    return this.integrationsService.connectIntegration(dto);
  }

  async deleteIntegration(id: string) {
    return this.integrationsService.deleteIntegration(id);
  }

  async syncNumbersForIntegration(integrationId: string) {
    return this.integrationsService.syncNumbersForIntegration(integrationId);
  }

  async addSenderNumber(integrationId: string, dto: AddSenderNumberDto) {
    return this.integrationsService.addSenderNumber(integrationId, dto);
  }

  async updateSenderNumber(numberId: string, dto: UpdateSenderNumberDto) {
    return this.integrationsService.updateSenderNumber(numberId, dto);
  }

  async deleteSenderNumber(numberId: string) {
    return this.integrationsService.deleteSenderNumber(numberId);
  }

  async listAllActiveSenderNumbers() {
    return this.integrationsService.listAllActiveSenderNumbers();
  }

  async resolveShortLink(
    code: string,
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    return this.trackingService.resolveShortLink(code, ip, userAgent);
  }

  async processWebhookEvents(events: SmsWebhookEvent[]) {
    return this.trackingService.processWebhookEvents(events);
  }

  // ── CORE SMS CAMPAIGN ORCHESTRATION & CRUD ──

  async getProjects() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        isCpProject: true,
        brochureUrl: true,
        builder: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private async resolveForeignKeys(
    dto: {
      projectId?: string;
      integrationId?: string;
      providerType?: string;
    },
    userId?: string,
  ) {
    let validProjectId: string | null = null;
    if (dto.projectId) {
      const exists = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true },
      });
      if (exists) validProjectId = exists.id;
    }

    let validIntegrationId: string | null = null;
    if (dto.integrationId) {
      const exists = await this.prisma.smsIntegration.findUnique({
        where: { id: dto.integrationId },
        select: { id: true },
      });
      if (exists) validIntegrationId = exists.id;
    } else if (dto.providerType) {
      const defaultIntegration = await this.prisma.smsIntegration.findFirst({
        where: { provider: dto.providerType as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: { id: true },
      });
      if (defaultIntegration) validIntegrationId = defaultIntegration.id;
    }

    let validUserId: string | null = null;
    if (userId) {
      const exists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (exists) validUserId = exists.id;
    }

    return {
      projectId: validProjectId,
      integrationId: validIntegrationId,
      userId: validUserId,
    };
  }

  async saveDraftCampaign(dto: SaveDraftSmsCampaignDto, userId?: string) {
    const {
      projectId,
      integrationId,
      userId: validUserId,
    } = await this.resolveForeignKeys(dto, userId);

    const hasMultiplePools = dto.senderPools && dto.senderPools.length > 1;
    const providerType = hasMultiplePools
      ? 'MULTI_PROVIDER'
      : (dto.senderPools?.[0]?.provider || dto.providerType || 'TWILIO');

    let savedCampaign: any;

    if (dto.campaignId) {
      const existing = await this.prisma.smsCampaign.findUnique({
        where: { id: dto.campaignId },
      });

      if (existing) {
        savedCampaign = await this.prisma.smsCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title !== undefined ? dto.title : existing.title,
            channel: dto.channel ?? existing.channel,
            providerType: (providerType as any) ?? existing.providerType,
            allocationMode: dto.allocationMode ?? existing.allocationMode,
            audienceSource: dto.audienceSource ?? existing.audienceSource,
            isCpCampaign: dto.isCpCampaign ?? existing.isCpCampaign,
            projectId: dto.projectId !== undefined ? projectId : existing.projectId,
            integrationId: dto.integrationId !== undefined ? integrationId : existing.integrationId,
            fromSender: dto.fromSender !== undefined ? (dto.fromSender || 'BrokerOS') : existing.fromSender,
            messageContent: dto.messageContent !== undefined ? dto.messageContent : existing.messageContent,
            dltTemplateId: dto.dltTemplateId !== undefined ? dto.dltTemplateId : existing.dltTemplateId,
            audienceFilters: dto.audienceFilters !== undefined ? (dto.audienceFilters as any) : existing.audienceFilters,
          },
        });
      }
    }

    if (!savedCampaign) {
      savedCampaign = await this.prisma.smsCampaign.create({
        data: {
          title: dto.title?.trim() ? dto.title : `SMS Draft — ${new Date().toLocaleDateString()}`,
          channel: dto.channel ?? 'SMS',
          providerType: providerType as any,
          allocationMode: dto.allocationMode || 'AUTO_EVEN',
          audienceSource: dto.audienceSource ?? 'CRM_DATABASE',
          isCpCampaign: dto.isCpCampaign ?? false,
          status: 'DRAFT',
          projectId,
          integrationId,
          fromSender: dto.fromSender || 'BrokerOS',
          messageContent: dto.messageContent || '',
          dltTemplateId: dto.dltTemplateId,
          audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : undefined,
          createdById: validUserId,
        },
      });
    }

    // Save sender pool configs if provided
    if (dto.senderPools && dto.senderPools.length > 0) {
      await this.prisma.campaignSmsSenderPool.deleteMany({
        where: { campaignId: savedCampaign.id },
      });

      await Promise.all(
        dto.senderPools.map(async (poolCfg) => {
          return this.prisma.campaignSmsSenderPool.create({
            data: {
              campaignId: savedCampaign.id,
              senderNumberId: poolCfg.senderNumberId || null,
              integrationId: poolCfg.integrationId || null,
              phoneNumber: poolCfg.phoneNumber || null,
              senderId: poolCfg.senderId || null,
              provider: poolCfg.provider || null,
              weight: Math.round(poolCfg.allocationPercentage || (100 / dto.senderPools!.length)),
              allocatedRecipients: poolCfg.allocatedLeads || 0,
              status: 'QUEUED',
            },
          });
        }),
      );
    }

    return savedCampaign;
  }

  async findAllCampaigns(query?: any) {
    return this.listCampaigns(query);
  }

  async findOneCampaign(id: string) {
    return this.getCampaign(id);
  }

  async listCampaigns(query?: { status?: string; isCpCampaign?: boolean }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.isCpCampaign !== undefined)
      where.isCpCampaign = query.isCpCampaign;

    return this.prisma.smsCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true, city: true, isCpProject: true },
        },
        integration: { select: { id: true, name: true, provider: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        senderPools: {
          include: {
            senderNumber: true,
          },
        },
        _count: {
          select: {
            recipients: true,
            shortLinks: true,
          },
        },
      },
    });
  }

  async getCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            city: true,
            isCpProject: true,
            brochureUrl: true,
          },
        },
        integration: true,
        createdBy: { select: { id: true, name: true, email: true } },
        senderPools: {
          include: {
            senderNumber: true,
          },
        },
        _count: {
          select: {
            recipients: true,
            shortLinks: true,
          },
        },
      },
    });

    if (!campaign) throw new NotFoundException('SMS Campaign not found');
    return campaign;
  }

  async createCampaign(dto: CreateSmsCampaignDto, userId?: string) {
    const {
      projectId,
      integrationId,
      userId: validUserId,
    } = await this.resolveForeignKeys(dto, userId);

    const hasMultiplePools = dto.senderPools && dto.senderPools.length > 1;
    const providerType = hasMultiplePools
      ? 'MULTI_PROVIDER'
      : (dto.senderPools?.[0]?.provider || dto.providerType || 'TWILIO');

    let campaign: any;
    if (dto.campaignId) {
      const existing = await this.prisma.smsCampaign.findUnique({
        where: { id: dto.campaignId },
      });

      if (existing) {
        campaign = await this.prisma.smsCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title,
            channel: dto.channel || 'SMS',
            providerType: providerType as any,
            allocationMode: dto.allocationMode || 'AUTO_EVEN',
            audienceSource: dto.audienceSource || 'CRM_DATABASE',
            isCpCampaign: dto.isCpCampaign ?? false,
            status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
            projectId,
            integrationId,
            fromSender: dto.fromSender || 'BrokerOS',
            messageContent: dto.messageContent || '',
            dltTemplateId: dto.dltTemplateId,
            audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : undefined,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          },
        });
      }
    }

    if (!campaign) {
      campaign = await this.prisma.smsCampaign.create({
        data: {
          title: dto.title,
          channel: dto.channel || 'SMS',
          providerType: providerType as any,
          allocationMode: dto.allocationMode || 'AUTO_EVEN',
          audienceSource: dto.audienceSource || 'CRM_DATABASE',
          isCpCampaign: dto.isCpCampaign ?? false,
          status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
          projectId,
          integrationId,
          fromSender: dto.fromSender || 'BrokerOS',
          messageContent: dto.messageContent || '',
          dltTemplateId: dto.dltTemplateId,
          audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : undefined,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          createdById: validUserId,
        },
      });
    }

    // Populate Audience
    await this.prisma.smsRecipient.deleteMany({
      where: { campaignId: campaign.id },
    });

    const normalizeRecipientPhone = (raw: string): string => {
      if (!raw) return '';
      let str = String(raw).trim();
      if (/[eE]\+?[0-9]+/.test(str)) {
        const num = Number(str);
        if (!isNaN(num) && isFinite(num)) {
          str = num.toLocaleString('fullwide', { useGrouping: false });
        }
      }
      str = str.replace(/[^\d+]/g, '');
      if (!str.startsWith('+')) {
        if (str.length === 10) {
          str = `+91${str}`;
        } else if (str.length === 12 && str.startsWith('91')) {
          str = `+${str}`;
        } else if (str.length === 11 && str.startsWith('1')) {
          str = `+${str}`;
        } else if (str.length > 0) {
          str = `+${str}`;
        }
      }
      return str;
    };

    const rawRecipients: any[] = [];

    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      for (const row of dto.csvRecipients) {
        if (!row.phone) continue;
        const normalized = normalizeRecipientPhone(row.phone);
        if (!normalized || normalized.length < 8) continue;
        rawRecipients.push({
          campaignId: campaign.id,
          phone: normalized,
          name: row.name?.trim() || 'Prospect',
          status: 'QUEUED',
          source: 'CSV_UPLOAD',
          mergeData: {
            name: row.name,
            budget: row.budget,
            city: row.city,
            projectName: (row as any).projectName || row.interestedProject,
          },
        });
      }
    } else {
      const whereClause = this.audienceService.buildLeadWhereClause(
        dto.audienceFilters,
        dto.isCpCampaign,
        dto.projectId,
      );

      const leads = await this.prisma.lead.findMany({
        where: whereClause,
        include: {
          interestedProject: { select: { name: true } },
          assignedUser: { select: { name: true, phoneNumber: true } },
        },
      });

      const seenPhones = new Set<string>();

      for (const lead of leads) {
        if (!lead.phone) continue;
        const phone = normalizeRecipientPhone(lead.phone);
        if (!phone || phone.length < 8 || seenPhones.has(phone)) continue;
        seenPhones.add(phone);

        rawRecipients.push({
          campaignId: campaign.id,
          leadId: lead.id,
          phone,
          name: `${lead.firstName} ${lead.lastName || ''}`.trim(),
          status: 'QUEUED',
          source: 'CRM_DATABASE',
          mergeData: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            projectName: lead.interestedProject?.name,
            agentName: lead.assignedUser?.name,
            agentPhone: lead.assignedUser?.phoneNumber,
          },
        });
      }
    }

    if (rawRecipients.length > 0) {
      if (dto.senderPools && dto.senderPools.length > 0) {
        const partitionResult = this.audienceService.partitionAudienceAcrossPools(
          rawRecipients,
          dto.senderPools,
          dto.allocationMode || 'AUTO_EVEN',
        );

        await this.prisma.campaignSmsSenderPool.deleteMany({
          where: { campaignId: campaign.id },
        });

        const createdPools = await Promise.all(
          dto.senderPools.map(async (poolCfg, idx) => {
            const alloc = partitionResult.allocations[idx];

            return this.prisma.campaignSmsSenderPool.create({
              data: {
                campaignId: campaign.id,
                senderNumberId: poolCfg.senderNumberId || null,
                integrationId: poolCfg.integrationId || null,
                phoneNumber: poolCfg.phoneNumber || null,
                senderId: poolCfg.senderId || null,
                provider: poolCfg.provider || null,
                weight: Math.round(alloc?.weight ?? poolCfg.allocationPercentage ?? (100 / dto.senderPools!.length)),
                allocatedRecipients: alloc?.count ?? 0,
                status: 'QUEUED',
              },
            });
          }),
        );

        const poolIdMap = new Map<number, string>();
        createdPools.forEach((cp, idx) => {
          poolIdMap.set(idx, cp.id);
        });

        const finalRecipients = partitionResult.partitionedRecipients.map((rec) => ({
          campaignId: rec.campaignId,
          leadId: rec.leadId || null,
          phone: rec.phone,
          name: rec.name,
          status: rec.status,
          source: rec.source,
          mergeData: rec.mergeData,
          senderPoolId: rec.poolIndex !== undefined ? poolIdMap.get(rec.poolIndex) || null : null,
          assignedSenderPhone: rec.assignedSenderPhone || null,
          assignedProvider: rec.assignedProvider || null,
        }));

        await this.prisma.smsRecipient.createMany({
          data: finalRecipients,
        });
      } else {
        await this.prisma.smsRecipient.createMany({
          data: rawRecipients,
        });
      }
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaign.id },
      data: { totalRecipients: rawRecipients.length },
    });

    if (!dto.scheduledAt) {
      this.triggerWorkerDispatch(campaign.id);
    }

    return campaign;
  }

  private triggerWorkerDispatch(campaignId: string) {
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:3334';
    fetch(`${workerUrl}/dispatch-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    }).catch(() => { });
  }

  async dispatchCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('SMS Campaign not found');

    await this.prisma.smsCampaign.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    this.triggerWorkerDispatch(id);
    return { success: true, message: `Dispatched SMS campaign ${id}` };
  }

  calculateCostEstimate(dto: CalculateSmsCostEstimateDto): SmsPreFlightCostSummary {
    const totalRecipients = Number(dto.totalRecipients) || 0;
    const pools = dto.senderPools || [];
    const messageContent = dto.messageContent || '';

    const { segments } = calculateSmsSegments(messageContent);
    const totalSegments = totalRecipients * segments;

    if (totalRecipients === 0 || pools.length === 0) {
      return {
        totalLeads: totalRecipients,
        totalSegments,
        totalCostUSD: 0,
        totalCostINR: 0,
        lineItems: [],
      };
    }

    let totalCostUSD = 0;
    let totalCostINR = 0;

    const lineItems = pools.map((p) => {
      const percentage = p.allocationPercentage || 100 / pools.length;
      const allocatedLeads = Math.round((totalRecipients * percentage) / 100);
      const allocatedSegments = allocatedLeads * segments;
      const provider = p.provider || 'TWILIO';
      const pricing =
        SMS_PROVIDER_PRICING_ESTIMATES[
        provider as keyof typeof SMS_PROVIDER_PRICING_ESTIMATES
        ] || SMS_PROVIDER_PRICING_ESTIMATES.TWILIO;

      const costUSD = allocatedSegments * pricing.costPerSegmentUSD;
      const costINR = allocatedSegments * pricing.costPerSegmentINR;

      totalCostUSD += costUSD;
      totalCostINR += costINR;

      return {
        provider: provider as any,
        providerName: pricing.label,
        phoneNumber: p.phoneNumber,
        senderId: p.senderId,
        allocatedLeads,
        percentage,
        estimatedSegments: allocatedSegments,
        costPerSegmentUSD: pricing.costPerSegmentUSD,
        costUSD: Number(costUSD.toFixed(4)),
        costINR: Number(costINR.toFixed(2)),
      };
    });

    return {
      totalLeads: totalRecipients,
      totalSegments,
      totalCostUSD: Number(totalCostUSD.toFixed(4)),
      totalCostINR: Number(totalCostINR.toFixed(2)),
      lineItems,
    };
  }

  async deleteCampaign(id: string) {
    return this.prisma.smsCampaign.delete({ where: { id } });
  }
}
