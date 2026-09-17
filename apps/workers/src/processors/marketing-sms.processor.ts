import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { TwilioSmsAdapter } from '@brokeros/int-sms-twilio';
import { AwsSnsSmsAdapter } from '@brokeros/int-sms-aws-sns';
import { SinchSmsAdapter } from '@brokeros/int-sms-sinch';
import { GupshupSmsAdapter } from '@brokeros/int-sms-gupshup';
import { InfobipSmsAdapter } from '@brokeros/int-sms-infobip';
import { VonageSmsAdapter } from '@brokeros/int-sms-vonage';
import { TelnyxSmsAdapter } from '@brokeros/int-sms-telnyx';
import { PlivoSmsAdapter } from '@brokeros/int-sms-plivo';
import { BirdSmsAdapter } from '@brokeros/int-sms-bird';
import {
  SMS_PROVIDER_THROTTLE_LIMITS,
  calculateSmsSegments,
} from '@brokeros/constants';
import type {
  ISmsMarketingProvider,
  SendSmsOptions,
  SmsProviderCredentials,
  SmsProviderType,
} from '@brokeros/types';

export interface SmsCampaignDispatchJobData {
  campaignId: string;
}

@Injectable()
export class MarketingSmsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingSmsProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;

  private readonly twilioAdapter = new TwilioSmsAdapter();
  private readonly awsSnsAdapter = new AwsSnsSmsAdapter();
  private readonly sinchAdapter = new SinchSmsAdapter();
  private readonly gupshupAdapter = new GupshupSmsAdapter();
  private readonly infobipAdapter = new InfobipSmsAdapter();
  private readonly vonageAdapter = new VonageSmsAdapter();
  private readonly telnyxAdapter = new TelnyxSmsAdapter();
  private readonly plivoAdapter = new PlivoSmsAdapter();
  private readonly birdAdapter = new BirdSmsAdapter();

  onModuleInit() {
    this.logger.log('MarketingSmsProcessor background auto-scanner started.');
    setTimeout(() => this.scanAndProcessPendingCampaigns(), 3000);
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
      const pendingCampaigns = await this.prisma.smsCampaign.findMany({
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
        take: 5,
      });

      for (const campaign of pendingCampaigns) {
        this.logger.log(
          `Auto-scanner picked up SMS campaign "${campaign.title}" (${campaign.id}) [status: ${campaign.status}]`,
        );
        await this.processSmsCampaign({ campaignId: campaign.id });
      }
    } catch (err: any) {
      this.logger.error(`SMS auto-scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

  private getAdapter(providerType: string): ISmsMarketingProvider {
    switch (providerType) {
      case 'AWS_SNS':
        return this.awsSnsAdapter;
      case 'SINCH':
        return this.sinchAdapter;
      case 'GUPSHUP':
        return this.gupshupAdapter;
      case 'INFOBIP':
        return this.infobipAdapter;
      case 'VONAGE':
        return this.vonageAdapter;
      case 'TELNYX':
        return this.telnyxAdapter;
      case 'PLIVO':
        return this.plivoAdapter;
      case 'BIRD':
        return this.birdAdapter;
      case 'TWILIO':
      default:
        return this.twilioAdapter;
    }
  }

  private mapCredentials(record: any, fromSenderOverride?: string): SmsProviderCredentials {
    return {
      accountSid: record?.accountSid || undefined,
      authToken: record?.authToken || undefined,
      messagingServiceSid: record?.messagingServiceSid || undefined,
      apiKey: record?.apiKey || undefined,
      apiSecret: record?.apiSecret || undefined,
      servicePlanId: record?.servicePlanId || undefined,
      awsAccessKeyId: record?.awsAccessKeyId || undefined,
      awsSecretKey: record?.awsSecretKey || undefined,
      awsRegion: record?.awsRegion || undefined,
      dltEntityId: record?.dltEntityId || undefined,
      baseUrl: record?.baseUrl || undefined,
      authId: record?.authId || undefined,
      fromNumber: fromSenderOverride || record?.fromSender,
      senderId: fromSenderOverride || record?.fromSender,
    };
  }

  // E.164 standard phone normalization (with Excel scientific notation un-exponential support)
  static normalizePhoneNumber(rawPhone: string, defaultCountryCode = '+91'): string {
    if (!rawPhone) return '';
    let str = String(rawPhone).trim();

    if (/[eE]\+?[0-9]+/.test(str)) {
      const num = Number(str);
      if (!isNaN(num) && isFinite(num)) {
        str = num.toLocaleString('fullwide', { useGrouping: false });
      }
    }

    const hasPlus = str.startsWith('+');
    const digits = str.replace(/\D/g, '');
    if (!digits) return '';

    if (hasPlus) return `+${digits}`;

    if (digits.length === 10) {
      return `${defaultCountryCode}${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    return `+${digits}`;
  }

  async processSmsCampaign(jobData: SmsCampaignDispatchJobData): Promise<void> {
    const { campaignId } = jobData;
    this.logger.log(`Starting SMS campaign dispatch for campaignId=${campaignId}`);

    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id: campaignId },
      include: {
        integration: {
          include: {
            senderNumbers: true,
          },
        },
        project: true,
        createdBy: true,
        senderPools: {
          include: {
            integration: true,
            senderNumber: {
              include: {
                integration: {
                  include: {
                    senderNumbers: true,
                  },
                },
              },
            },
          },
        },
        recipients: {
          where: { status: 'QUEUED' },
          take: 5000,
        },
      },
    });

    if (!campaign) {
      this.logger.error(`SMS Campaign ${campaignId} not found`);
      return;
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const appBaseUrl = process.env.API_PUBLIC_URL || 'http://localhost:3333';

    if (campaign.senderPools && campaign.senderPools.length > 0) {
      this.logger.log(
        `SMS Campaign ${campaignId} has ${campaign.senderPools.length} sender pools. Spawning parallel worker streams...`,
      );

      await Promise.all(
        campaign.senderPools.map((pool: any) =>
          this.processPhoneStream(campaign, pool, appBaseUrl),
        ),
      );
    } else {
      // Single-sender legacy fallback
      const adapter = this.getAdapter(campaign.providerType);
      let credentials: SmsProviderCredentials | undefined;
      let effectiveFromPhone = campaign.fromSender;

      if (campaign.integration) {
        if (campaign.providerType === 'TWILIO') {
          if (campaign.integration.messagingServiceSid) {
            effectiveFromPhone = campaign.integration.messagingServiceSid;
          } else if (!effectiveFromPhone || !effectiveFromPhone.startsWith('+')) {
            const candidate =
              campaign.integration.senderNumbers?.find((s: any) => s.phoneNumber?.startsWith('+'))?.phoneNumber ||
              (campaign.integration.fromSender?.startsWith('+') ? campaign.integration.fromSender : null) ||
              process.env.TWILIO_PHONE_NUMBER;
            if (candidate) {
              effectiveFromPhone = candidate;
            }
          }
        }

        credentials = this.mapCredentials(campaign.integration, effectiveFromPhone);
      } else {
        const activeIntegration = await this.prisma.smsIntegration.findFirst({
          where: { provider: campaign.providerType as any, isActive: true },
          include: { senderNumbers: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        if (activeIntegration) {
          if (campaign.providerType === 'TWILIO') {
            if (activeIntegration.messagingServiceSid) {
              effectiveFromPhone = activeIntegration.messagingServiceSid;
            } else if (!effectiveFromPhone || !effectiveFromPhone.startsWith('+')) {
              effectiveFromPhone =
                activeIntegration.senderNumbers?.find((s: any) => s.phoneNumber?.startsWith('+'))?.phoneNumber ||
                (activeIntegration.fromSender?.startsWith('+') ? activeIntegration.fromSender : null) ||
                process.env.TWILIO_PHONE_NUMBER ||
                '';
            }
          }

          credentials = this.mapCredentials(activeIntegration, effectiveFromPhone);
        }
      }

      const batchSize = 50;
      const recipients = campaign.recipients;

      for (let i = 0; i < recipients.length; i += batchSize) {
        const chunk = recipients.slice(i, i + batchSize);

        for (const rec of chunk) {
          try {
            const mergeData = (rec.mergeData as any) || {};
            const recipientName = rec.name || mergeData.name || 'Client';
            const firstName = mergeData.firstName || recipientName.split(' ')[0] || 'Client';

            const normalizedPhone = MarketingSmsProcessor.normalizePhoneNumber(rec.phone);
            if (!normalizedPhone || normalizedPhone.length < 8) {
              await this.prisma.smsRecipient.update({
                where: { id: rec.id },
                data: {
                  status: 'FAILED',
                  failReason: 'Invalid phone number format',
                  assignedProvider: campaign.providerType,
                  assignedSenderPhone: campaign.fromSender,
                },
              });
              await this.prisma.smsCampaign.update({
                where: { id: campaignId },
                data: { failedCount: { increment: 1 } },
              });
              continue;
            }

            const shortCode = `${Math.random().toString(36).substring(2, 6)}${Date.now().toString(36).slice(-2)}`;
            const destinationUrl = campaign.project?.brochureUrl || 'https://brokeros.io';

            await this.prisma.smsShortLink.create({
              data: {
                code: shortCode,
                destinationUrl,
                campaignId,
                recipientId: rec.id,
              },
            });

            const shortUrl = `${appBaseUrl}/s/${shortCode}`;

            const tagData = {
              firstName,
              fullName: recipientName,
              projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
              projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
              projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Corridor',
              agentName: mergeData.agentName || campaign.createdBy?.name || 'Sales Team',
              agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
              shortUrl,
              optOut: 'Reply STOP to unsub',
            };

            let personalizedMsg = campaign.messageContent
              .replace(/{{lead\.firstName}}/gi, tagData.firstName)
              .replace(/{{lead\.fullName}}/gi, tagData.fullName)
              .replace(/{{project\.name}}/gi, tagData.projectName)
              .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
              .replace(/{{project\.location}}/gi, tagData.projectLocation)
              .replace(/{{agent\.name}}/gi, tagData.agentName)
              .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
              .replace(/{{shortUrl}}/gi, tagData.shortUrl)
              .replace(/{{optOut}}/gi, tagData.optOut);

            if (!personalizedMsg.includes(shortUrl) && !campaign.messageContent.includes('{{shortUrl}}')) {
              personalizedMsg = personalizedMsg.replace(/https?:\/\/[^\s]+/gi, shortUrl);
            }

            const { segments } = calculateSmsSegments(personalizedMsg);

            const sendOptions: SendSmsOptions = {
              from: effectiveFromPhone,
              to: [{ phone: normalizedPhone, name: recipientName }],
              message: personalizedMsg,
              campaignId,
              dltTemplateId: campaign.dltTemplateId || undefined,
              dltEntityId: credentials?.dltEntityId || undefined,
            };

            const sendResult = await adapter.sendBatch(sendOptions, credentials);

            if (sendResult.success) {
              await this.prisma.smsRecipient.update({
                where: { id: rec.id },
                data: {
                  status: 'DELIVERED',
                  providerMsgId: sendResult.providerMessageId,
                  segmentsCount: segments,
                  sentAt: new Date(),
                  deliveredAt: new Date(),
                  assignedProvider: campaign.providerType,
                  assignedSenderPhone: effectiveFromPhone,
                },
              });
              await this.prisma.smsCampaign.update({
                where: { id: campaignId },
                data: {
                  sentCount: { increment: 1 },
                  deliveredCount: { increment: 1 },
                  totalSegmentsSent: { increment: segments },
                },
              });

              await this.recordSentSmsToInbox({
                campaign,
                recipient: rec,
                fromPhone: effectiveFromPhone,
                personalizedMsg,
                segments,
                provider: campaign.providerType,
                providerMsgId: sendResult.providerMessageId,
              });
            } else {
              await this.prisma.smsRecipient.update({
                where: { id: rec.id },
                data: {
                  status: 'FAILED',
                  failReason: sendResult.error || 'Carrier dispatch error',
                  segmentsCount: segments,
                  assignedProvider: campaign.providerType,
                  assignedSenderPhone: effectiveFromPhone,
                },
              });
              await this.prisma.smsCampaign.update({
                where: { id: campaignId },
                data: { failedCount: { increment: 1 } },
              });
            }
          } catch (itemErr: any) {
            this.logger.error(`Failed to dispatch SMS to recipient ${rec.phone}: ${itemErr?.message}`);
          }
        }
      }
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.logger.log(`SMS Campaign ${campaignId} processing complete!`);
  }

  private async processPhoneStream(
    campaign: any,
    pool: any,
    appBaseUrl: string,
  ): Promise<void> {
    const senderNumberRecord = pool.senderNumber;

    // Priority 1: pool has a direct integrationId (user explicitly selected this account)
    let integration: any = pool.integration ?? null;

    // Priority 2: integration linked through the registered sender number
    if (!integration) {
      integration = senderNumberRecord?.integration ?? null;
    }

    const poolProvider = pool.provider || senderNumberRecord?.provider;

    // Priority 3: find by provider + phone number (best-effort match)
    if (!integration && poolProvider) {
      if (pool.phoneNumber) {
        integration = await this.prisma.smsIntegration.findFirst({
          where: {
            provider: poolProvider as any,
            isActive: true,
            OR: [
              { fromSender: pool.phoneNumber },
              { senderNumbers: { some: { phoneNumber: pool.phoneNumber } } },
            ],
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      }

      // Priority 4: any active integration for this provider
      if (!integration) {
        integration = await this.prisma.smsIntegration.findFirst({
          where: { provider: poolProvider as any, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      }
    }

    // Priority 5: campaign-level integration
    if (!integration) {
      integration = campaign.integration;
    }

    const provider = (integration?.provider || poolProvider || campaign.providerType || 'TWILIO') as SmsProviderType;
    const adapter = this.getAdapter(provider);

    const throttleConfig =
      SMS_PROVIDER_THROTTLE_LIMITS[provider as keyof typeof SMS_PROVIDER_THROTTLE_LIMITS] ||
      SMS_PROVIDER_THROTTLE_LIMITS.TWILIO;
    const pacingDelayMs = throttleConfig.delayMs || 15;

    const fromPhone =
      pool.phoneNumber ||
      pool.senderId ||
      senderNumberRecord?.phoneNumber ||
      senderNumberRecord?.senderId ||
      integration?.fromSender ||
      campaign.fromSender;

    let credentials: SmsProviderCredentials | undefined;
    if (integration) {
      credentials = this.mapCredentials(integration, fromPhone);
    }

    await this.prisma.campaignSmsSenderPool.update({
      where: { id: pool.id },
      data: { status: 'STREAMING' },
    });

    const recipients = await this.prisma.smsRecipient.findMany({
      where: {
        campaignId: campaign.id,
        senderPoolId: pool.id,
        status: 'QUEUED',
      },
      take: 5000,
      orderBy: { createdAt: 'asc' },
    });

    this.logger.log(
      `[PhoneStream ${fromPhone}] Starting stream with ${recipients.length} recipients via ${provider} (pacing: ${pacingDelayMs}ms, integrationId=${integration?.id || 'none'})`,
    );

    let consecutiveRateLimits = 0;

    for (const rec of recipients) {
      try {
        if (pacingDelayMs > 0) {
          await new Promise((r) => setTimeout(r, pacingDelayMs));
        }

        const normalizedPhone = MarketingSmsProcessor.normalizePhoneNumber(rec.phone);
        if (!normalizedPhone || normalizedPhone.length < 8) {
          await this.prisma.smsRecipient.update({
            where: { id: rec.id },
            data: {
              status: 'FAILED',
              failReason: 'Invalid phone number format',
              assignedProvider: provider,
              assignedSenderPhone: fromPhone,
            },
          });
          await this.prisma.campaignSmsSenderPool.update({
            where: { id: pool.id },
            data: { failedCount: { increment: 1 } },
          });
          await this.prisma.smsCampaign.update({
            where: { id: campaign.id },
            data: { failedCount: { increment: 1 } },
          });
          continue;
        }

        const mergeData = (rec.mergeData as any) || {};
        const recipientName = rec.name || mergeData.name || 'Client';
        const firstName = mergeData.firstName || recipientName.split(' ')[0] || 'Client';

        const shortCode = `${Math.random().toString(36).substring(2, 6)}${Date.now().toString(36).slice(-2)}`;
        const destinationUrl = campaign.project?.brochureUrl || 'https://brokeros.io';

        await this.prisma.smsShortLink.create({
          data: {
            code: shortCode,
            destinationUrl,
            campaignId: campaign.id,
            recipientId: rec.id,
          },
        });

        const shortUrl = `${appBaseUrl}/s/${shortCode}`;

        const tagData = {
          firstName,
          fullName: recipientName,
          projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
          projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
          projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Corridor',
          agentName: mergeData.agentName || campaign.createdBy?.name || 'Sales Team',
          agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
          shortUrl,
          optOut: 'Reply STOP to unsub',
        };

        let personalizedMsg = campaign.messageContent
          .replace(/{{lead\.firstName}}/gi, tagData.firstName)
          .replace(/{{lead\.fullName}}/gi, tagData.fullName)
          .replace(/{{project\.name}}/gi, tagData.projectName)
          .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
          .replace(/{{project\.location}}/gi, tagData.projectLocation)
          .replace(/{{agent\.name}}/gi, tagData.agentName)
          .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
          .replace(/{{shortUrl}}/gi, tagData.shortUrl)
          .replace(/{{optOut}}/gi, tagData.optOut);

        if (!personalizedMsg.includes(shortUrl) && !campaign.messageContent.includes('{{shortUrl}}')) {
          personalizedMsg = personalizedMsg.replace(/https?:\/\/[^\s]+/gi, shortUrl);
        }

        const { segments } = calculateSmsSegments(personalizedMsg);

        const sendOptions: SendSmsOptions = {
          from: fromPhone,
          to: [{ phone: normalizedPhone, name: recipientName }],
          message: personalizedMsg,
          campaignId: campaign.id,
          dltTemplateId: campaign.dltTemplateId || undefined,
          dltEntityId: credentials?.dltEntityId || undefined,
        };

        let sendResult = await adapter.sendBatch(sendOptions, credentials);

        // Check for 429 Too Many Requests rate-limit backoff
        if (!sendResult.success && sendResult.error && /rate limit|429|too many/i.test(sendResult.error)) {
          consecutiveRateLimits++;
          const backoffTime = Math.min(2500 * consecutiveRateLimits, 15000);
          this.logger.warn(`[PhoneStream ${fromPhone}] 429 Rate Limit hit. Backing off for ${backoffTime}ms...`);
          await new Promise((r) => setTimeout(r, backoffTime));
          sendResult = await adapter.sendBatch(sendOptions, credentials);
        } else {
          consecutiveRateLimits = 0;
        }

        if (sendResult.success) {
          await this.prisma.smsRecipient.update({
            where: { id: rec.id },
            data: {
              status: 'DELIVERED',
              providerMsgId: sendResult.providerMessageId,
              segmentsCount: segments,
              sentAt: new Date(),
              deliveredAt: new Date(),
              assignedProvider: provider,
              assignedSenderPhone: fromPhone,
            },
          });

          await this.prisma.campaignSmsSenderPool.update({
            where: { id: pool.id },
            data: {
              sentCount: { increment: 1 },
              deliveredCount: { increment: 1 },
            },
          });

          await this.prisma.smsCampaign.update({
            where: { id: campaign.id },
            data: {
              sentCount: { increment: 1 },
              deliveredCount: { increment: 1 },
              totalSegmentsSent: { increment: segments },
            },
          });

          if (senderNumberRecord?.id) {
            await this.prisma.smsSenderNumber.update({
              where: { id: senderNumberRecord.id },
              data: { sentToday: { increment: 1 } },
            }).catch(() => { });
          }

          await this.recordSentSmsToInbox({
            campaign,
            recipient: rec,
            fromPhone,
            personalizedMsg,
            segments,
            provider,
            providerMsgId: sendResult.providerMessageId,
          });
        } else {
          await this.prisma.smsRecipient.update({
            where: { id: rec.id },
            data: {
              status: 'FAILED',
              failReason: sendResult.error || 'Carrier delivery error',
              segmentsCount: segments,
              assignedProvider: provider,
              assignedSenderPhone: fromPhone,
            },
          });

          await this.prisma.campaignSmsSenderPool.update({
            where: { id: pool.id },
            data: {
              failedCount: { increment: 1 },
            },
          });

          await this.prisma.smsCampaign.update({
            where: { id: campaign.id },
            data: {
              failedCount: { increment: 1 },
            },
          });
        }
      } catch (itemErr: any) {
        this.logger.error(`[PhoneStream ${fromPhone}] Failed recipient ${rec.phone}: ${itemErr?.message}`);
      }
    }

    await this.prisma.campaignSmsSenderPool.update({
      where: { id: pool.id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`[PhoneStream ${fromPhone}] Stream finished`);
  }

  private async recordSentSmsToInbox(params: {
    campaign: any;
    recipient: any;
    fromPhone: string;
    personalizedMsg: string;
    segments: number;
    provider: string;
    providerMsgId?: string;
  }): Promise<void> {
    try {
      const {
        campaign,
        recipient,
        fromPhone,
        personalizedMsg,
        segments,
        provider,
        providerMsgId,
      } = params;

      const recipientPhone = (recipient.phone || '').trim();
      if (!recipientPhone) return;

      let conversation = await this.prisma.smsConversation.findFirst({
        where: { contactPhone: recipientPhone, isActive: true },
      });

      if (!conversation) {
        conversation = await this.prisma.smsConversation.create({
          data: {
            contactPhone: recipientPhone,
            contactName: recipient.name || recipientPhone,
            leadId: recipient.leadId || null,
            agentUserId: campaign.createdById || null,
            status: 'open',
            lastMessageText: personalizedMsg,
            lastMessageAt: new Date(),
            assignedProvider: provider,
            assignedSenderPhone: fromPhone,
            campaignId: campaign.id,
            recipientId: recipient.id,
            unreadCount: 0,
          },
        });
      } else {
        await this.prisma.smsConversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageText: personalizedMsg,
            lastMessageAt: new Date(),
            assignedProvider: provider,
            assignedSenderPhone: fromPhone,
            leadId: recipient.leadId || conversation.leadId,
            campaignId: campaign.id,
            recipientId: recipient.id,
          },
        });
      }

      await this.prisma.smsMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'OUTBOUND',
          senderType: 'agent',
          senderName: campaign.fromSender || fromPhone,
          fromPhone,
          toPhone: recipientPhone,
          bodyText: personalizedMsg,
          segmentsCount: segments || 1,
          status: 'SENT',
          provider,
          providerMsgId: providerMsgId || null,
          sentAt: new Date(),
        },
      });
    } catch (inboxErr: any) {
      this.logger.warn(`Failed to link sent SMS to inbox thread: ${inboxErr?.message}`);
    }
  }
}
