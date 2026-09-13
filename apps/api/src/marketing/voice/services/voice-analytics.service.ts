import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type { VoiceCampaignAnalyticsSummary } from '@brokeros/types';
import { mapVoiceSentimentToTemperature } from '@brokeros/constants';

@Injectable()
export class VoiceAnalyticsService {
  private readonly logger = new Logger(VoiceAnalyticsService.name);
  private readonly prisma = prismaClient;

  async getCampaignAnalytics(
    campaignId: string,
  ): Promise<VoiceCampaignAnalyticsSummary> {
    const campaign = await this.prisma.voiceCampaign.findUnique({
      where: { id: campaignId },
      include: {
        telephony: true,
        agentIntegration: true,
        recipients: {
          take: 100,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            phone: true,
            name: true,
            callDurationSec: true,
            disposition: true,
            sentiment: true,
            summary: true,
            recordingUrl: true,
            transcript: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Voice Campaign ${campaignId} not found`);
    }

    const totalRecipients =
      campaign.totalRecipients ||
      (await this.prisma.voiceRecipient.count({ where: { campaignId } }));
    const completedCalls = campaign.completedCalls;
    const busyCalls = campaign.busyCalls;
    const noAnswerCalls = campaign.noAnswerCalls;
    const failedCalls = campaign.failedCalls;

    const completionRate =
      totalRecipients > 0
        ? Math.round((completedCalls / totalRecipients) * 100)
        : 0;
    const averageDurationSec =
      completedCalls > 0
        ? Math.round(campaign.totalDurationSec / completedCalls)
        : 0;

    // Sentiment breakdown
    const positiveCount = await this.prisma.voiceRecipient.count({
      where: { campaignId, sentiment: 'POSITIVE' },
    });
    const neutralCount = await this.prisma.voiceRecipient.count({
      where: { campaignId, sentiment: 'NEUTRAL' },
    });
    const negativeCount = await this.prisma.voiceRecipient.count({
      where: { campaignId, sentiment: 'NEGATIVE' },
    });

    const recentCallLogs = campaign.recipients.map((r) => ({
      recipientId: r.id,
      phone: r.phone,
      name: r.name || undefined,
      durationSec: r.callDurationSec,
      disposition: r.disposition || 'PENDING',
      sentiment: r.sentiment || undefined,
      mappedTemperature: mapVoiceSentimentToTemperature(r.sentiment),
      summary: r.summary || undefined,
      recordingUrl: r.recordingUrl || undefined,
      transcript: r.transcript || undefined,
    }));

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status,
      telephonyType: campaign.telephony?.provider || 'TWILIO',
      agentPlatform: campaign.agentIntegration?.platform || 'VAPI',
      callerIdNumber: campaign.callerIdNumber || undefined,
      totalRecipients,
      completedCalls,
      busyCalls,
      noAnswerCalls,
      failedCalls,
      completionRate,
      averageDurationSec,
      totalDurationSec: campaign.totalDurationSec,
      sentimentBreakdown: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
      },
      recentCallLogs,
    };
  }

  async getOverallMetrics() {
    const totalCampaigns = await this.prisma.voiceCampaign.count();
    const activeCampaigns = await this.prisma.voiceCampaign.count({
      where: { status: 'PROCESSING' },
    });
    const completedCampaigns = await this.prisma.voiceCampaign.count({
      where: { status: 'COMPLETED' },
    });

    const aggregations = await this.prisma.voiceCampaign.aggregate({
      _sum: {
        totalRecipients: true,
        completedCalls: true,
        totalDurationSec: true,
      },
    });

    const totalCallsPlaced = aggregations._sum.totalRecipients || 0;
    const totalCallsCompleted = aggregations._sum.completedCalls || 0;
    const totalTalkTimeSec = aggregations._sum.totalDurationSec || 0;

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalCallsPlaced,
      totalCallsCompleted,
      totalTalkTimeSec,
      overallCompletionRate:
        totalCallsPlaced > 0
          ? Math.round((totalCallsCompleted / totalCallsPlaced) * 100)
          : 0,
    };
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(Number(query?.limit) || 20, 100));
    const skip = (page - 1) * limit;

    const where: any = { campaignId };
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { phone: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.voiceRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.voiceRecipient.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
