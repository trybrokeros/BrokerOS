import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import { MailgunAdapter } from '@brokeros/int-mail-mailgun';
import { GmailAdapter } from '@brokeros/int-mail-gmail';
import { OutlookAdapter } from '@brokeros/int-mail-outlook';
import { ConstantContactAdapter } from '@brokeros/int-mail-constant-contact';
import { PROVIDER_THROTTLE_LIMITS } from '@brokeros/constants';
import type {
  EmailProviderType,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
} from '@brokeros/types';

export interface CampaignDispatchJobData {
  campaignId: string;
}

@Injectable()
export class MarketingEmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingEmailProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;

  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();
  private readonly mailgunAdapter = new MailgunAdapter();
  private readonly gmailAdapter = new GmailAdapter();
  private readonly outlookAdapter = new OutlookAdapter();
  private readonly constantContactAdapter = new ConstantContactAdapter();

  onModuleInit() {
    this.logger.log('MarketingEmailProcessor background auto-scanner started.');
    // Immediate scan on startup
    setTimeout(() => this.scanAndProcessPendingCampaigns(), 2000);
    // Recurring scan every 8 seconds
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
      // Find campaigns that have QUEUED recipients and need processing
      const pendingCampaigns = await this.prisma.marketingCampaign.findMany({
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
          `Auto-scanner picked up campaign "${campaign.title}" (${campaign.id}) [status: ${campaign.status}]`,
        );
        await this.processCampaign({ campaignId: campaign.id });
      }
    } catch (err: any) {
      this.logger.error(`Auto-scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

  private getAdapter(providerType: string): IEmailMarketingProvider {
    switch (providerType) {
      case 'SENDGRID':
        return this.sendgridAdapter;
      case 'BREVO':
        return this.brevoAdapter;
      case 'MAILCHIMP':
        return this.mailchimpAdapter;
      case 'MAILGUN':
        return this.mailgunAdapter;
      case 'GMAIL':
        return this.gmailAdapter;
      case 'OUTLOOK':
        return this.outlookAdapter;
      case 'CONSTANT_CONTACT':
        return this.constantContactAdapter;
      case 'AWS_SES':
      case 'SYSTEM_DEFAULT':
      default:
        return this.sesAdapter;
    }
  }

  private mapCredentials(
    integration: any,
    fromEmailOverride?: string,
    fromNameOverride?: string,
  ): ProviderCredentials {
    return {
      apiKey: integration.apiKey || undefined,
      awsAccessKeyId: integration.awsAccessKeyId || undefined,
      awsSecretKey: integration.awsSecretKey || undefined,
      awsRegion: integration.awsRegion || undefined,
      mailchimpServer: integration.mailchimpServer || undefined,
      mailgunDomain: integration.mailgunDomain || undefined,
      mailgunRegion: integration.mailgunRegion || undefined,
      oauthClientId: integration.oauthClientId || undefined,
      oauthClientSecret: integration.oauthClientSecret || undefined,
      oauthRefreshToken: integration.oauthRefreshToken || undefined,
      oauthTenantId: integration.oauthTenantId || undefined,
      googleAppPassword: integration.googleAppPassword || undefined,
      fromEmail: fromEmailOverride || integration.fromEmail,
      fromName: fromNameOverride || integration.fromName,
    };
  }

  async processCampaign(jobData: CampaignDispatchJobData): Promise<void> {
    const { campaignId } = jobData;
    this.logger.log(`Starting email campaign processing for campaignId=${campaignId}`);

    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: {
        integration: true,
        project: true,
        createdBy: true,
        senderPools: {
          include: {
            integration: true,
            senderDomain: {
              include: {
                integration: true,
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
      this.logger.error(`Campaign ${campaignId} not found`);
      return;
    }

    await this.prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const appBaseUrl =
      process.env.API_PUBLIC_URL ||
      'http://localhost:3333';

    if (campaign.senderPools && campaign.senderPools.length > 0) {
      this.logger.log(
        `Campaign ${campaignId} has ${campaign.senderPools.length} sender domain pools. Spawning parallel execution streams...`,
      );

      await Promise.all(
        campaign.senderPools.map((pool: any) =>
          this.processDomainStream(campaign, pool, appBaseUrl),
        ),
      );
    } else {
      // Single-provider legacy fallback
      const adapter = this.getAdapter(campaign.providerType);
      let credentials: ProviderCredentials | undefined;

      if (campaign.integration) {
        credentials = this.mapCredentials(campaign.integration);
      } else if (campaign.providerType !== 'SYSTEM_DEFAULT') {
        const activeIntegration = await this.prisma.marketingIntegration.findFirst({
          where: { provider: campaign.providerType as any, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
        if (activeIntegration) {
          credentials = this.mapCredentials(activeIntegration);
        }
      }

      const batchSize = 100;
      const recipients = campaign.recipients;

      for (let i = 0; i < recipients.length; i += batchSize) {
        const chunk = recipients.slice(i, i + batchSize);

        for (const rec of chunk) {
          try {
            const mergeData = (rec.mergeData as any) || {};
            const recipientName = rec.name || mergeData.name || 'Valued Client';
            const nameParts = recipientName.trim().split(' ');
            const firstName = mergeData.firstName || nameParts[0] || 'Valued Client';
            const lastName = mergeData.lastName || nameParts.slice(1).join(' ') || '';

            const tagData = {
              firstName,
              lastName,
              fullName: recipientName,
              city: mergeData.city || campaign.project?.city || 'your city',
              projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
              projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Location',
              projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
              projectBrochureUrl: campaign.project?.brochureUrl || '#',
              agentName: mergeData.agentName || campaign.createdBy?.name || campaign.fromName || 'Sales Team',
              agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
              unsubscribeUrl: `${appBaseUrl}/api/marketing/unsubscribe?email=${encodeURIComponent(rec.email)}&cid=${campaignId}`,
            };

            const replaceTags = (text: string) => {
              if (!text) return '';
              return text
                .replace(/{{lead\.firstName}}/gi, tagData.firstName)
                .replace(/{{lead\.lastName}}/gi, tagData.lastName)
                .replace(/{{lead\.fullName}}/gi, tagData.fullName)
                .replace(/{{lead\.city}}/gi, tagData.city)
                .replace(/{{project\.name}}/gi, tagData.projectName)
                .replace(/{{project\.location}}/gi, tagData.projectLocation)
                .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
                .replace(/{{project\.brochureUrl}}/gi, tagData.projectBrochureUrl)
                .replace(/{{agent\.name}}/gi, tagData.agentName)
                .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
                .replace(/{{unsubscribeUrl}}/gi, tagData.unsubscribeUrl);
            };

            let personalizedHtml = replaceTags(campaign.htmlContent);
            const personalizedSubject = replaceTags(campaign.subject);

            // Inject open tracking pixel
            const openPixelUrl = `${appBaseUrl}/api/marketing/track/open?cid=${campaignId}&rid=${rec.id}`;
            const trackingPixelHtml = `<img src="${openPixelUrl}" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin:0 !important;padding:0 !important;" />`;
            personalizedHtml += trackingPixelHtml;

            // Rewrite links for click tracking
            personalizedHtml = personalizedHtml.replace(
              /href=["'](https?:\/\/[^"']+)["']/gi,
              (match, originalUrl) => {
                if (originalUrl.includes('/api/marketing/')) return match;
                const clickTrackUrl = `${appBaseUrl}/api/marketing/track/click?cid=${campaignId}&rid=${rec.id}&url=${encodeURIComponent(originalUrl)}`;
                return `href="${clickTrackUrl}"`;
              },
            );

            const sendOptions: SendEmailOptions = {
              fromEmail: campaign.fromEmail,
              fromName: campaign.fromName,
              replyTo: campaign.replyTo || undefined,
              to: [{ email: rec.email, name: rec.name || undefined }],
              subject: personalizedSubject,
              htmlContent: personalizedHtml,
            };

            const sendResult = await adapter.sendBatch(sendOptions, credentials);

            if (sendResult.success) {
              await this.prisma.campaignRecipient.update({
                where: { id: rec.id },
                data: {
                  status: 'DELIVERED',
                  providerMsgId: sendResult.providerMessageId,
                  sentAt: new Date(),
                  deliveredAt: new Date(),
                },
              });
              await this.prisma.marketingCampaign.update({
                where: { id: campaignId },
                data: {
                  sentCount: { increment: 1 },
                  deliveredCount: { increment: 1 },
                },
              });

              await this.recordSentEmailToInbox({
                campaign,
                recipient: rec,
                fromEmail: campaign.fromEmail,
                fromName: campaign.fromName || 'Sales Team',
                personalizedSubject,
                personalizedHtml,
                provider: campaign.providerType,
                providerMsgId: sendResult.providerMessageId,
              });
            } else {
              await this.prisma.campaignRecipient.update({
                where: { id: rec.id },
                data: { status: 'FAILED', bounceReason: sendResult.error },
              });
            }
          } catch (itemErr: any) {
            this.logger.error(`Failed to send to recipient ${rec.email}: ${itemErr?.message}`);
          }
        }
      }
    }

    await this.prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.logger.log(`Campaign ${campaignId} processing finished`);
  }

  private async processDomainStream(
    campaign: any,
    pool: any,
    appBaseUrl: string,
  ): Promise<void> {
    const domainRecord = pool.senderDomain;

    // Priority 1: pool has a direct integrationId (user explicitly selected this account)
    let integration: any = pool.integration ?? null;

    // Priority 2: integration linked through the verified sender domain
    if (!integration) {
      integration = domainRecord?.integration ?? null;
    }

    const poolProvider = pool.provider || pool.assignedProvider;

    // Priority 3: find by provider + fromEmail (best-effort match when no direct link)
    if (!integration && poolProvider) {
      if (pool.fromEmail) {
        integration = await this.prisma.marketingIntegration.findFirst({
          where: {
            provider: poolProvider as any,
            isActive: true,
            OR: [
              { fromEmail: pool.fromEmail },
              { senderDomains: { some: { fromEmail: pool.fromEmail } } },
            ],
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      }

      // Priority 4: any active integration for this provider
      if (!integration) {
        integration = await this.prisma.marketingIntegration.findFirst({
          where: { provider: poolProvider as any, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      }
    }

    // Priority 5: campaign-level integration
    if (!integration) {
      integration = campaign.integration;
    }

    const provider = (integration?.provider || poolProvider || campaign.providerType || 'SYSTEM_DEFAULT') as EmailProviderType;
    const adapter = this.getAdapter(provider);

    const throttleConfig =
      PROVIDER_THROTTLE_LIMITS[provider as keyof typeof PROVIDER_THROTTLE_LIMITS] ||
      PROVIDER_THROTTLE_LIMITS.SYSTEM_DEFAULT;
    const pacingDelayMs = throttleConfig.delayMs || 15;

    const fromEmail = pool.fromEmail || domainRecord?.fromEmail || integration?.fromEmail || campaign.fromEmail;
    const fromName = pool.fromName || domainRecord?.fromName || integration?.fromName || campaign.fromName || 'Sales Team';
    const replyTo = domainRecord?.replyTo || integration?.replyTo || campaign.replyTo || undefined;

    let credentials: ProviderCredentials | undefined;
    if (integration) {
      credentials = this.mapCredentials(integration, fromEmail, fromName);
    } else {
      this.logger.warn(
        `[DomainStream ${fromEmail}] No integration found in database for pool provider=${provider}. Using default adapter environment credentials.`,
      );
    }

    const recipients = await this.prisma.campaignRecipient.findMany({
      where: {
        campaignId: campaign.id,
        senderPoolId: pool.id,
        status: 'QUEUED',
      },
      take: 5000,
      orderBy: { createdAt: 'asc' },
    });

    const domainEmail = fromEmail || domainRecord?.fromEmail || pool.id;
    this.logger.log(
      `[DomainStream ${domainEmail}] Starting stream with ${recipients.length} recipients via ${provider} (pacing: ${pacingDelayMs}ms, integrationId=${integration?.id || 'none'})`,
    );

    let consecutiveRateLimits = 0;

    for (const rec of recipients) {
      try {
        if (pacingDelayMs > 0) {
          await new Promise((r) => setTimeout(r, pacingDelayMs));
        }

        const mergeData = (rec.mergeData as any) || {};
        const recipientName = rec.name || mergeData.name || 'Valued Client';
        const nameParts = recipientName.trim().split(' ');
        const firstName = mergeData.firstName || nameParts[0] || 'Valued Client';
        const lastName = mergeData.lastName || nameParts.slice(1).join(' ') || '';

        const tagData = {
          firstName,
          lastName,
          fullName: recipientName,
          city: mergeData.city || campaign.project?.city || 'your city',
          projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
          projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Location',
          projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
          projectBrochureUrl: campaign.project?.brochureUrl || '#',
          agentName: mergeData.agentName || campaign.createdBy?.name || fromName,
          agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
          unsubscribeUrl: `${appBaseUrl}/api/marketing/unsubscribe?email=${encodeURIComponent(rec.email)}&cid=${campaign.id}`,
        };

        const replaceTags = (text: string) => {
          if (!text) return '';
          return text
            .replace(/{{lead\.firstName}}/gi, tagData.firstName)
            .replace(/{{lead\.lastName}}/gi, tagData.lastName)
            .replace(/{{lead\.fullName}}/gi, tagData.fullName)
            .replace(/{{lead\.city}}/gi, tagData.city)
            .replace(/{{project\.name}}/gi, tagData.projectName)
            .replace(/{{project\.location}}/gi, tagData.projectLocation)
            .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
            .replace(/{{project\.brochureUrl}}/gi, tagData.projectBrochureUrl)
            .replace(/{{agent\.name}}/gi, tagData.agentName)
            .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
            .replace(/{{unsubscribeUrl}}/gi, tagData.unsubscribeUrl);
        };

        let personalizedHtml = replaceTags(campaign.htmlContent);
        const personalizedSubject = replaceTags(campaign.subject);

        // Inject open tracking pixel
        const openPixelUrl = `${appBaseUrl}/api/marketing/track/open?cid=${campaign.id}&rid=${rec.id}`;
        const trackingPixelHtml = `<img src="${openPixelUrl}" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin:0 !important;padding:0 !important;" />`;
        personalizedHtml += trackingPixelHtml;

        // Rewrite links for click tracking
        personalizedHtml = personalizedHtml.replace(
          /href=["'](https?:\/\/[^"']+)["']/gi,
          (match, originalUrl) => {
            if (originalUrl.includes('/api/marketing/')) return match;
            const clickTrackUrl = `${appBaseUrl}/api/marketing/track/click?cid=${campaign.id}&rid=${rec.id}&url=${encodeURIComponent(originalUrl)}`;
            return `href="${clickTrackUrl}"`;
          },
        );

        const sendOptions: SendEmailOptions = {
          fromEmail,
          fromName,
          replyTo,
          to: [{ email: rec.email, name: rec.name || undefined }],
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
        };

        let sendResult = await adapter.sendBatch(sendOptions, credentials);

        // Dynamic rate limit handling with backoff
        if (!sendResult.success && sendResult.error?.toLowerCase().includes('rate limit')) {
          consecutiveRateLimits++;
          this.logger.warn(
            `[DomainStream ${fromEmail}] Rate limit hit (${consecutiveRateLimits}). Backing off for 2.5s...`,
          );
          await new Promise((r) => setTimeout(r, 2500));
          // Retry once
          sendResult = await adapter.sendBatch(sendOptions, credentials);
        } else {
          consecutiveRateLimits = 0;
        }

        if (sendResult.success) {
          await this.prisma.campaignRecipient.update({
            where: { id: rec.id },
            data: {
              status: 'DELIVERED',
              providerMsgId: sendResult.providerMessageId,
              sentAt: new Date(),
              deliveredAt: new Date(),
            },
          });

          await Promise.all([
            this.prisma.campaignSenderPool.update({
              where: { id: pool.id },
              data: {
                sentCount: { increment: 1 },
                deliveredCount: { increment: 1 },
              },
            }),
            this.prisma.marketingCampaign.update({
              where: { id: campaign.id },
              data: {
                sentCount: { increment: 1 },
                deliveredCount: { increment: 1 },
              },
            }),
          ]);

          await this.recordSentEmailToInbox({
            campaign,
            recipient: rec,
            fromEmail,
            fromName,
            personalizedSubject,
            personalizedHtml,
            provider,
            providerMsgId: sendResult.providerMessageId,
          });
        } else {
          this.logger.error(
            `[DomainStream ${fromEmail}] Failed sending to ${rec.email} via ${provider}: ${sendResult.error}`,
          );

          await this.prisma.campaignRecipient.update({
            where: { id: rec.id },
            data: { status: 'FAILED', bounceReason: sendResult.error },
          });

          await this.prisma.campaignSenderPool.update({
            where: { id: pool.id },
            data: {
              failedCount: { increment: 1 },
            },
          });
        }
      } catch (itemErr: any) {
        this.logger.error(
          `[DomainStream ${fromEmail}] Error sending to ${rec.email}: ${itemErr?.message}`,
        );
      }
    }

    this.logger.log(`[DomainStream ${fromEmail}] Stream completed.`);
  }

  private async recordSentEmailToInbox(params: {
    campaign: any;
    recipient: any;
    fromEmail: string;
    fromName: string;
    personalizedSubject: string;
    personalizedHtml: string;
    provider: string;
    providerMsgId?: string;
  }): Promise<void> {
    try {
      const {
        campaign,
        recipient,
        fromEmail,
        fromName,
        personalizedSubject,
        personalizedHtml,
        provider,
        providerMsgId,
      } = params;

      const recipientEmail = recipient.email.toLowerCase().trim();

      let conversation = await this.prisma.emailConversation.findFirst({
        where: { contactEmail: recipientEmail, isActive: true },
      });

      if (!conversation) {
        conversation = await this.prisma.emailConversation.create({
          data: {
            contactEmail: recipientEmail,
            contactName: recipient.name || recipientEmail.split('@')[0],
            subject: personalizedSubject,
            leadId: recipient.leadId || null,
            agentUserId: campaign.createdById || null,
            status: 'open',
            lastMessageText: personalizedSubject || 'Broadcast Email Sent',
            lastMessageAt: new Date(),
            assignedProvider: provider,
            assignedSenderEmail: fromEmail,
            assignedSenderName: fromName,
            campaignId: campaign.id,
            recipientId: recipient.id,
            unreadCount: 0,
          },
        });
      } else {
        await this.prisma.emailConversation.update({
          where: { id: conversation.id },
          data: {
            subject: personalizedSubject || conversation.subject,
            lastMessageText: personalizedSubject || conversation.lastMessageText,
            lastMessageAt: new Date(),
            assignedProvider: provider,
            assignedSenderEmail: fromEmail,
            assignedSenderName: fromName,
            leadId: recipient.leadId || conversation.leadId,
            campaignId: campaign.id,
            recipientId: recipient.id,
          },
        });
      }

      await this.prisma.emailMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'OUTBOUND',
          senderType: 'agent',
          senderName: fromName,
          fromEmail,
          toEmail: recipientEmail,
          subject: personalizedSubject,
          bodyHtml: personalizedHtml,
          bodyText: personalizedSubject,
          status: 'SENT',
          provider,
          providerMsgId: providerMsgId || null,
          sentAt: new Date(),
          deliveredAt: new Date(),
        },
      });
    } catch (inboxErr: any) {
      this.logger.warn(`Failed to link sent email to inbox thread: ${inboxErr?.message}`);
    }
  }
}
