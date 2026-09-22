import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { getVoiceAgentProvider, tryCarrierBridgeDispatch } from '@brokeros/int-voice';
import { normalizeVoiceLeadVariables, interpolateVoiceTemplate } from '@brokeros/constants';
import type {
  VoiceAgentPlatform,
  VoiceTelephonyCredentials,
  VoiceAgentCredentials,
  SendVoiceOptions,
  SendVoiceResult,
} from '@brokeros/types';

export interface VoiceCampaignDispatchJobData {
  campaignId: string;
}

@Injectable()
export class MarketingVoiceProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingVoiceProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.logger.log('MarketingVoiceProcessor background auto-scanner started.');
    setTimeout(() => this.scanAndProcessPendingCampaigns(), 4000);
    this.scanInterval = setInterval(() => this.scanAndProcessPendingCampaigns(), 8000);
  }

  onModuleDestroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  async scanAndProcessPendingCampaigns(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      const pendingCampaigns = await this.prisma.voiceCampaign.findMany({
        where: {
          OR: [
            { status: 'PROCESSING' },
            {
              status: 'SCHEDULED',
              OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
            },
            {
              status: 'DRAFT',
              recipients: { some: { status: 'QUEUED' } },
            },
          ],
          recipients: {
            some: { status: 'QUEUED' },
          },
        },
        select: { id: true, title: true, status: true },
        take: 3,
      });

      for (const campaign of pendingCampaigns) {
        this.logger.log(
          `Auto-scanner picked up Voice campaign "${campaign.title}" (${campaign.id}) [status: ${campaign.status}]`,
        );
        await this.processVoiceCampaign({ campaignId: campaign.id });
      }
    } catch (err: any) {
      this.logger.error(`Voice auto-scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

  static isWithinCallingWindow(start?: string | null, end?: string | null): boolean {
    if (!start || !end) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startMinutes =
      (Number.isFinite(startH) ? startH : 9) * 60 +
      (Number.isFinite(startM) ? startM : 0);
    const endMinutes =
      (Number.isFinite(endH) ? endH : 20) * 60 +
      (Number.isFinite(endM) ? endM : 0);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  static normalizePhoneNumber(rawPhone: string, defaultCountryCode = '+91'): string {
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

  async processVoiceCampaign(data: VoiceCampaignDispatchJobData): Promise<void> {
    const { campaignId } = data;

    const campaign = await this.prisma.voiceCampaign.findUnique({
      where: { id: campaignId },
      include: {
        telephony: true,
        agentIntegration: true,
        project: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!campaign) {
      this.logger.error(`Voice campaign ${campaignId} not found`);
      return;
    }

    // Check calling hours window
    if (!MarketingVoiceProcessor.isWithinCallingWindow(campaign.callingWindowStart, campaign.callingWindowEnd)) {
      this.logger.warn(
        `Campaign ${campaign.title} is outside calling window (${campaign.callingWindowStart} - ${campaign.callingWindowEnd}). Pausing dispatch until window opens.`,
      );
      return;
    }

    // Mark status PROCESSING
    if (campaign.status !== 'PROCESSING') {
      await this.prisma.voiceCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'PROCESSING',
          startedAt: campaign.startedAt || new Date(),
        },
      });
    }

    // Fetch QUEUED recipients
    const queuedRecipients = await this.prisma.voiceRecipient.findMany({
      where: {
        campaignId,
        status: 'QUEUED',
      },
      take: 100,
    });

    if (queuedRecipients.length === 0) {
      await this.finalizeCampaign(campaignId);
      return;
    }

    // Resolve credentials
    const telephonyCreds: VoiceTelephonyCredentials = {
      provider: campaign.telephony?.provider,
      accountSid: campaign.telephony?.accountSid || undefined,
      authToken: campaign.telephony?.authToken || undefined,
      apiKey: campaign.telephony?.apiKey || undefined,
      apiToken: campaign.telephony?.apiToken || undefined,
      subdomain: campaign.telephony?.subdomain || undefined,
      sipDomain: campaign.telephony?.sipDomain || undefined,
      fromNumbers: campaign.telephony?.fromNumbers || [],
    };

    const agentCreds: VoiceAgentCredentials = {
      apiKey: campaign.agentIntegration?.apiKey || '',
      orgId: campaign.agentIntegration?.orgId || undefined,
      serverUrl: campaign.agentIntegration?.serverUrl || undefined,
    };

    const platform = (campaign.agentIntegration?.platform || 'VAPI') as VoiceAgentPlatform;
    const voiceAgentProvider = getVoiceAgentProvider(platform, agentCreds);

    const fromNumber =
      campaign.callerIdNumber ||
      campaign.telephony?.fromNumbers?.[0] ||
      '+14155550199';

    const maxConcurrency = Math.max(1, Math.min(campaign.maxConcurrentCalls || 5, 20));

    this.logger.log(
      `Dispatching ${queuedRecipients.length} calls for Voice Campaign "${campaign.title}" (Concurrency: ${maxConcurrency}, Platform: ${platform})`,
    );

    // Process in concurrency chunks
    for (let i = 0; i < queuedRecipients.length; i += maxConcurrency) {
      const chunk = queuedRecipients.slice(i, i + maxConcurrency);

      await Promise.all(
        chunk.map(async (recipient) => {
          const normalizedPhone = MarketingVoiceProcessor.normalizePhoneNumber(recipient.phone);
          const normalizedVariables = normalizeVoiceLeadVariables(
            recipient,
            campaign.project
              ? {
                name: campaign.project.name,
                city: campaign.project.city || undefined,
                address: campaign.project.address || undefined,
              }
              : undefined,
            campaign.createdBy?.name || 'Senior Property Advisor',
          );

          const resolvedFirstMessage = interpolateVoiceTemplate(campaign.firstMessage || undefined, normalizedVariables);
          const resolvedScriptPrompt = interpolateVoiceTemplate(campaign.scriptPrompt || undefined, normalizedVariables);

          const studioSettings = (campaign.studioSettings as Record<string, any>) || {};

          const sendOptions: SendVoiceOptions = {
            toPhone: normalizedPhone,
            fromNumber,
            campaignId,
            recipientId: recipient.id,
            llmModel: campaign.llmModel,
            voiceProvider: campaign.voiceProvider,
            voiceId: campaign.voiceId,
            voiceName: campaign.voiceName,
            scriptPrompt: resolvedScriptPrompt,
            firstMessage: resolvedFirstMessage,
            telephonyCredentials: telephonyCreds,
            agentCredentials: agentCreds,
            variables: normalizedVariables,
            ...studioSettings,
          };

          try {
            let result: SendVoiceResult;

            if (campaign.telephonyId) {
              // Option B: CRM Telephony Carrier Bridge
              const carrierBridge = await tryCarrierBridgeDispatch(platform, sendOptions);
              if (carrierBridge.handled && carrierBridge.result) {
                result = carrierBridge.result;
              } else {
                result = {
                  success: false,
                  error: `Carrier line for ${campaign.telephony?.provider || 'selected carrier'} could not be dispatched.`,
                };
              }
            } else {
              // Option A: Direct PSTN via AI Agent Platform
              result = await voiceAgentProvider.dispatchOutboundCall(sendOptions, agentCreds);
            }

            if (result.success) {
              await this.prisma.voiceRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: 'SENT',
                  providerCallId: result.providerCallId,
                  sentAt: new Date(),
                },
              });

              // Create audit log
              await this.prisma.voiceCallLog.create({
                data: {
                  campaignId,
                  recipientId: recipient.id,
                  disposition: 'IN_PROGRESS',
                  durationSec: 0,
                },
              });
            } else {
              await this.prisma.voiceRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: 'FAILED',
                  failReason: result.error || 'Failed to dispatch voice call',
                  failedAt: new Date(),
                },
              });
            }
          } catch (err: any) {
            this.logger.error(`Error dialing recipient ${recipient.phone}: ${err?.message}`);
            await this.prisma.voiceRecipient.update({
              where: { id: recipient.id },
              data: {
                status: 'FAILED',
                failReason: err?.message || 'Unexpected voice worker dispatch error',
                failedAt: new Date(),
              },
            });
          }
        }),
      );

      // Brief rate-limiting pause between chunks to respect carrier CPS limits
      if (i + maxConcurrency < queuedRecipients.length) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    await this.finalizeCampaign(campaignId);
  }

  private async finalizeCampaign(campaignId: string): Promise<void> {
    const totalRecipients = await this.prisma.voiceRecipient.count({ where: { campaignId } });
    const completedCalls = await this.prisma.voiceRecipient.count({
      where: { campaignId, disposition: 'COMPLETED' },
    });
    const busyCalls = await this.prisma.voiceRecipient.count({
      where: { campaignId, disposition: 'BUSY' },
    });
    const noAnswerCalls = await this.prisma.voiceRecipient.count({
      where: { campaignId, disposition: 'NO_ANSWER' },
    });
    const failedCalls = await this.prisma.voiceRecipient.count({
      where: { campaignId, status: 'FAILED' },
    });
    const remainingQueued = await this.prisma.voiceRecipient.count({
      where: { campaignId, status: 'QUEUED' },
    });

    const isAllDone = remainingQueued === 0;

    await this.prisma.voiceCampaign.update({
      where: { id: campaignId },
      data: {
        totalRecipients,
        completedCalls,
        busyCalls,
        noAnswerCalls,
        failedCalls,
        status: isAllDone ? 'COMPLETED' : 'PROCESSING',
        completedAt: isAllDone ? new Date() : undefined,
      },
    });

    this.logger.log(
      `Voice Campaign ${campaignId} sync: Total=${totalRecipients}, Completed=${completedCalls}, Failed=${failedCalls}, Remaining=${remainingQueued}`,
    );
  }
}
