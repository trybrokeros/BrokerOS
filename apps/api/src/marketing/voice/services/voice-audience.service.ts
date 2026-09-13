import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type {
  PreviewVoiceAudienceDto,
  VoiceAudienceFiltersDto,
  VoiceCsvRecipientDto,
  BulkAssignVoiceLeadsDto,
  ExportVoiceLeadsDto,
} from '../dto/voice.dto.js';
import type { VoiceAudienceEstimationResult } from '@brokeros/types';
import { mapVoiceSentimentToTemperature } from '@brokeros/constants';

@Injectable()
export class VoiceAudienceService {
  private readonly logger = new Logger(VoiceAudienceService.name);
  private readonly prisma = prismaClient;

  static normalizePhoneNumber(
    rawPhone: string,
    defaultCountryCode = '+91',
  ): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = `${defaultCountryCode}${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = `+${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }
    return cleaned;
  }

  buildLeadWhereClause(
    filters: any = {},
    isCpCampaign?: boolean,
    projectId?: string,
  ) {
    const whereClause: any = {
      deletedAt: null,
      phone: { not: '' },
    };

    if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
      whereClause.status = { in: filters.statuses };
    } else {
      whereClause.status = {
        in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'],
      };
    }

    if (filters.temperatures?.length) {
      whereClause.temperature = { in: filters.temperatures };
    }

    const targetProject = filters.projectId || projectId;
    if (targetProject && targetProject !== 'ALL' && targetProject !== '') {
      whereClause.interestedProjectId = targetProject;
    }

    if (filters.minBudget) {
      whereClause.budget = { gte: Number(filters.minBudget) };
    }

    if (isCpCampaign) {
      whereClause.brokerId = { not: null };
    }

    return whereClause;
  }

  async estimateAudience(
    dto: PreviewVoiceAudienceDto,
  ): Promise<VoiceAudienceEstimationResult> {
    // 1. If audience source is CSV_UPLOAD, ONLY process the CSV rows
    if (dto.audienceSource === 'CSV_UPLOAD') {
      if (
        !dto.csvRecipients ||
        !Array.isArray(dto.csvRecipients) ||
        dto.csvRecipients.length === 0
      ) {
        return {
          totalCount: 0,
          validPhoneCount: 0,
          duplicateCount: 0,
          dndCount: 0,
          finalAudienceCount: 0,
        };
      }

      const seenPhones = new Set<string>();
      let validPhoneCount = 0;
      let duplicateCount = 0;

      for (const row of dto.csvRecipients) {
        const rawPhone = (
          row.phone ||
          row.phoneNumber ||
          row.mobile ||
          row.contact ||
          ''
        ).toString();
        const phone = VoiceAudienceService.normalizePhoneNumber(rawPhone);
        if (!phone || phone.length < 8) continue;

        if (seenPhones.has(phone)) {
          duplicateCount++;
          continue;
        }
        seenPhones.add(phone);
        validPhoneCount++;
      }

      return {
        totalCount: dto.csvRecipients.length,
        validPhoneCount,
        duplicateCount,
        dndCount: 0,
        finalAudienceCount: validPhoneCount,
      };
    }

    // 2. Otherwise process CRM Database Leads
    const whereClause = this.buildLeadWhereClause(
      dto.audienceFilters,
      dto.isCpCampaign,
      dto.projectId,
    );

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: { id: true, phone: true },
    });

    const seenPhones = new Set<string>();
    let duplicateCount = 0;
    let validPhoneCount = 0;

    for (const lead of leads) {
      if (!lead.phone) continue;
      const norm = VoiceAudienceService.normalizePhoneNumber(lead.phone);
      if (!norm || norm.length < 8) continue;

      if (seenPhones.has(norm)) {
        duplicateCount++;
        continue;
      }
      seenPhones.add(norm);
      validPhoneCount++;
    }

    // 3. If HYBRID, also merge CSV
    if (dto.audienceSource === 'HYBRID' && dto.csvRecipients?.length) {
      for (const row of dto.csvRecipients) {
        const rawPhone = (
          row.phone ||
          row.phoneNumber ||
          row.mobile ||
          row.contact ||
          ''
        ).toString();
        const norm = VoiceAudienceService.normalizePhoneNumber(rawPhone);
        if (!norm || norm.length < 8) continue;

        if (seenPhones.has(norm)) {
          duplicateCount++;
          continue;
        }
        seenPhones.add(norm);
        validPhoneCount++;
      }

      return {
        totalCount: leads.length + dto.csvRecipients.length,
        validPhoneCount,
        duplicateCount,
        dndCount: 0,
        finalAudienceCount: validPhoneCount,
      };
    }

    return {
      totalCount: leads.length,
      validPhoneCount,
      duplicateCount,
      dndCount: 0,
      finalAudienceCount: validPhoneCount,
    };
  }

  async resolveAudienceRecipients(dto: {
    audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';
    audienceFilters?: any;
    csvRecipients?: any[];
    isCpCampaign?: boolean;
    projectId?: string;
  }): Promise<
    Array<{
      phone: string;
      name?: string;
      leadId?: string;
      source: 'CRM_DATABASE' | 'CSV_UPLOAD';
      mergeData?: any;
    }>
  > {
    const seenPhones = new Set<string>();
    const recipients: Array<{
      phone: string;
      name?: string;
      leadId?: string;
      source: 'CRM_DATABASE' | 'CSV_UPLOAD';
      mergeData?: any;
    }> = [];

    // 1. Process CSV Recipients if CSV_UPLOAD or HYBRID
    if (dto.audienceSource === 'CSV_UPLOAD') {
      if (dto.csvRecipients?.length) {
        for (const csv of dto.csvRecipients) {
          const rawPhone = (
            csv.phone ||
            csv.phoneNumber ||
            csv.mobile ||
            csv.contact ||
            ''
          ).toString();
          const norm = VoiceAudienceService.normalizePhoneNumber(rawPhone);
          if (norm.length >= 8 && !seenPhones.has(norm)) {
            seenPhones.add(norm);
            recipients.push({
              phone: norm,
              name: csv.name || csv.fullName || 'Prospect',
              source: 'CSV_UPLOAD',
              mergeData: csv.mergeData || csv || {},
            });
          }
        }
      }
      return recipients;
    }

    if (dto.audienceSource === 'HYBRID' && dto.csvRecipients?.length) {
      for (const csv of dto.csvRecipients) {
        const rawPhone = (
          csv.phone ||
          csv.phoneNumber ||
          csv.mobile ||
          csv.contact ||
          ''
        ).toString();
        const norm = VoiceAudienceService.normalizePhoneNumber(rawPhone);
        if (norm.length >= 8 && !seenPhones.has(norm)) {
          seenPhones.add(norm);
          recipients.push({
            phone: norm,
            name: csv.name || csv.fullName || 'Prospect',
            source: 'CSV_UPLOAD',
            mergeData: csv.mergeData || csv || {},
          });
        }
      }
    }

    // 2. Fetch CRM Leads for CRM_DATABASE or HYBRID
    const whereClause = this.buildLeadWhereClause(
      dto.audienceFilters,
      dto.isCpCampaign,
      dto.projectId,
    );

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferredLocation: true,
        budget: true,
        temperature: true,
        status: true,
      },
    });

    for (const lead of leads) {
      if (!lead.phone) continue;
      const norm = VoiceAudienceService.normalizePhoneNumber(lead.phone);
      if (norm.length >= 8 && !seenPhones.has(norm)) {
        seenPhones.add(norm);
        const fullName = [lead.firstName, lead.lastName]
          .filter(Boolean)
          .join(' ');
        recipients.push({
          phone: norm,
          name: fullName || undefined,
          leadId: lead.id,
          source: 'CRM_DATABASE',
          mergeData: {
            fullName,
            firstName: lead.firstName,
            city: lead.preferredLocation || '',
            budget: lead.budget ? `₹${lead.budget}` : '',
            temperature: lead.temperature || '',
            status: lead.status,
          },
        });
      }
    }

    return recipients;
  }

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    const recipient = await this.prisma.voiceRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient)
      throw new NotFoundException('Voice Recipient record not found');
    if (recipient.leadId)
      throw new BadRequestException(
        'Recipient is already linked to a CRM Lead',
      );

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        phone: recipient.phone,
        temperature: merge.temperature || 'HOT',
        status: 'INTERESTED',
        interestedProjectId: recipient.campaign.projectId,
        budget: merge.budget ? Number(merge.budget) : null,
        createdById: userId,
      },
    });

    await this.prisma.voiceRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }

  async bulkAssignRecipientsToCrm(
    dto: BulkAssignVoiceLeadsDto,
    userId?: string,
  ): Promise<{ success: boolean; count: number; message: string }> {
    const where: any = { campaignId: dto.campaignId };

    if (dto.recipientIds && dto.recipientIds.length > 0) {
      where.id = { in: dto.recipientIds };
    }

    if (dto.sentimentFilter && dto.sentimentFilter !== 'ALL') {
      where.sentiment = dto.sentimentFilter;
    }

    const recipients = await this.prisma.voiceRecipient.findMany({
      where,
      include: {
        campaign: true,
        lead: true,
      },
    });

    if (recipients.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No recipients matched the selection criteria.',
      };
    }

    // Resolve an active user ID for audit notes/call records if userId is not provided
    let auditUserId = userId;
    if (!auditUserId) {
      const fallbackUser = await this.prisma.user.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      auditUserId = fallbackUser?.id;
    }

    let processedCount = 0;

    for (const recipient of recipients) {
      const mappedTemp =
        dto.customTemperature ||
        mapVoiceSentimentToTemperature(recipient.sentiment) ||
        'WARM';

      const targetLeadStatus = (dto.status as any) || 'NEW';
      const targetSubStatus = dto.subStatus || 'PENDING';
      const targetAssignedUserId = dto.assignToUserId || null; // null routes directly into Pre-Sales unassigned intake (/new-leads)

      let leadId = recipient.leadId;

      if (leadId) {
        // Update existing CRM Lead
        await this.prisma.lead.update({
          where: { id: leadId },
          data: {
            temperature: mappedTemp as any,
            status: targetLeadStatus,
            subStatus: targetSubStatus,
            assignedUserId: targetAssignedUserId,
          },
        });
      } else {
        // Create new CRM Lead from Voice Recipient
        const nameParts = (recipient.name || 'Prospect').trim().split(' ');
        const firstName = nameParts[0] || 'Prospect';
        const lastName = nameParts.slice(1).join(' ') || undefined;
        const merge = (recipient.mergeData as any) || {};

        const newLead = await this.prisma.lead.create({
          data: {
            firstName,
            lastName,
            phone: recipient.phone,
            status: targetLeadStatus,
            subStatus: targetSubStatus,
            temperature: mappedTemp as any,
            interestedProjectId: recipient.campaign?.projectId || undefined,
            budget: merge.budget ? Number(merge.budget) : null,
            assignedUserId: targetAssignedUserId,
            createdById: auditUserId,
          },
        });

        leadId = newLead.id;

        await this.prisma.voiceRecipient.update({
          where: { id: recipient.id },
          data: { leadId },
        });
      }

      // Attach rich CRM Note with Recording, Transcript & AI Summary
      if (auditUserId && leadId) {
        let noteBody = `[Voice Campaign Lead - Routed to Pre-Sales Queue]\n`;
        noteBody += `• Campaign: ${recipient.campaign?.title || 'Voice Campaign'}\n`;
        noteBody += `• Mapped Temperature: ${mappedTemp} (AI Sentiment: ${recipient.sentiment || 'UNKNOWN'})\n`;
        noteBody += `• Call Disposition: ${recipient.disposition || 'COMPLETED'} (${recipient.callDurationSec || 0}s)\n`;
        if (recipient.summary) {
          noteBody += `• AI Key Summary: ${recipient.summary}\n`;
        }
        if (recipient.recordingUrl) {
          noteBody += `• Audio Recording Link: ${recipient.recordingUrl}\n`;
        }
        if (recipient.transcript) {
          const excerpt =
            recipient.transcript.length > 800
              ? recipient.transcript.slice(0, 800) + '...'
              : recipient.transcript;
          noteBody += `• Turn-by-Turn Transcript:\n"${excerpt}"`;
        }

        await this.prisma.note.create({
          data: {
            leadId,
            userId: auditUserId,
            content: noteBody,
            noteType: 'AI_VOICE_CAMPAIGN',
          },
        });

        // Add CRM Call Record
        let callStatus:
          | 'CONNECTED'
          | 'NOT_ANSWERED'
          | 'BUSY'
          | 'FAILED'
          | 'VOICEMAIL' = 'CONNECTED';
        if (recipient.disposition === 'BUSY') callStatus = 'BUSY';
        else if (recipient.disposition === 'NO_ANSWER') callStatus = 'NOT_ANSWERED';
        else if (recipient.disposition === 'FAILED') callStatus = 'FAILED';
        else if (recipient.disposition === 'VOICEMAIL') callStatus = 'VOICEMAIL';

        const duration = recipient.callDurationSec || 0;
        await this.prisma.callRecord.create({
          data: {
            leadId,
            userId: auditUserId,
            phoneNumber: recipient.phone,
            direction: 'OUTBOUND',
            status: callStatus,
            duration,
            startedAt: recipient.completedAt
              ? new Date(recipient.completedAt.getTime() - duration * 1000)
              : new Date(),
            endedAt: recipient.completedAt || new Date(),
            recordingUrl: recipient.recordingUrl,
            aiTranscript: recipient.transcript,
            aiSummary: recipient.summary,
            aiSentiment: recipient.sentiment,
          },
        });
      }

      processedCount++;
    }

    return {
      success: true,
      count: processedCount,
      message: `Successfully routed ${processedCount} leads to Pre-Sales queue with full call recordings and transcripts.`,
    };
  }

  async getExportLeadsData(dto: ExportVoiceLeadsDto) {
    const where: any = { campaignId: dto.campaignId };

    if (dto.recipientIds && dto.recipientIds.length > 0) {
      where.id = { in: dto.recipientIds };
    }

    if (dto.sentimentFilter && dto.sentimentFilter !== 'ALL') {
      where.sentiment = dto.sentimentFilter;
    }

    const recipients = await this.prisma.voiceRecipient.findMany({
      where,
      include: {
        campaign: true,
        lead: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const rows = recipients.map((r) => {
      const leadName = r.lead
        ? `${r.lead.firstName} ${r.lead.lastName || ''}`.trim()
        : r.name || 'Prospect';
      const mappedTemp =
        mapVoiceSentimentToTemperature(r.sentiment) || 'WARM';

      return {
        recipientId: r.id,
        phone: r.phone,
        name: leadName,
        status: r.status,
        disposition: r.disposition || 'PENDING',
        durationSeconds: r.callDurationSec || 0,
        sentiment: r.sentiment || 'UNKNOWN',
        mappedTemperature: mappedTemp,
        summary: r.summary || '',
        recordingUrl: r.recordingUrl || '',
        transcript: (r.transcript || '').replace(/\r?\n/g, ' '),
        leadId: r.leadId || '',
        completedAt: r.completedAt ? r.completedAt.toISOString() : '',
      };
    });

    return {
      campaignId: dto.campaignId,
      totalCount: rows.length,
      rows,
    };
  }
}
