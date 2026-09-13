import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
} from '@brokeros/types';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import { MailgunAdapter } from '@brokeros/int-mail-mailgun';
import { GmailAdapter } from '@brokeros/int-mail-gmail';
import { OutlookAdapter } from '@brokeros/int-mail-outlook';
import { ConstantContactAdapter } from '@brokeros/int-mail-constant-contact';
import {
  ConnectIntegrationDto,
  SendTestEmailDto,
  AddSenderDomainDto,
  UpdateSenderDomainDto,
} from '../dto/email.dto.js';

@Injectable()
export class EmailIntegrationsService {
  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();
  private readonly mailgunAdapter = new MailgunAdapter();
  private readonly gmailAdapter = new GmailAdapter();
  private readonly outlookAdapter = new OutlookAdapter();
  private readonly constantContactAdapter = new ConstantContactAdapter();

  constructor(private readonly prisma: PrismaService) { }

  getAdapter(providerType: string): IEmailMarketingProvider {
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

  private mapCredentials(intOrDto: any): ProviderCredentials {
    return {
      apiKey: intOrDto.apiKey || intOrDto.constantContactApiKey || undefined,
      awsAccessKeyId: intOrDto.awsAccessKeyId || undefined,
      awsSecretKey: intOrDto.awsSecretKey || undefined,
      awsRegion: intOrDto.awsRegion || undefined,
      mailchimpServer: intOrDto.mailchimpServer || undefined,
      mailgunDomain: intOrDto.mailgunDomain || undefined,
      mailgunRegion: (intOrDto.mailgunRegion as any) || undefined,
      googleClientId: intOrDto.oauthClientId || intOrDto.googleClientId || undefined,
      googleClientSecret: intOrDto.oauthClientSecret || intOrDto.googleClientSecret || undefined,
      googleRefreshToken: intOrDto.oauthRefreshToken || intOrDto.googleRefreshToken || undefined,
      googleAppPassword: intOrDto.googleAppPassword || undefined,
      microsoftTenantId: intOrDto.oauthTenantId || intOrDto.microsoftTenantId || undefined,
      microsoftClientId: intOrDto.oauthClientId || intOrDto.microsoftClientId || undefined,
      microsoftClientSecret: intOrDto.oauthClientSecret || intOrDto.microsoftClientSecret || undefined,
      microsoftRefreshToken: intOrDto.oauthRefreshToken || intOrDto.microsoftRefreshToken || undefined,
      constantContactApiKey: intOrDto.constantContactApiKey || intOrDto.apiKey || undefined,
      constantContactSecret: intOrDto.constantContactSecret || intOrDto.oauthClientSecret || undefined,
      constantContactRefreshToken: intOrDto.constantContactRefreshToken || intOrDto.oauthRefreshToken || undefined,
      fromEmail: intOrDto.fromEmail,
      fromName: intOrDto.fromName,
      replyTo: intOrDto.replyTo,
    };
  }

  renderMergeTags(
    template: string,
    data: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
      city?: string;
      projectName?: string;
      projectLocation?: string;
      projectStartingPrice?: string;
      projectBrochureUrl?: string;
      agentName?: string;
      agentPhone?: string;
      unsubscribeUrl?: string;
    },
  ): string {
    if (!template) return '';
    return template
      .replace(/{{lead\.firstName}}/gi, data.firstName || 'Valued Prospect')
      .replace(/{{lead\.lastName}}/gi, data.lastName || '')
      .replace(
        /{{lead\.fullName}}/gi,
        data.fullName || data.firstName || 'Valued Prospect',
      )
      .replace(/{{lead\.city}}/gi, data.city || 'your city')
      .replace(/{{project\.name}}/gi, data.projectName || 'Luxury Residence')
      .replace(
        /{{project\.location}}/gi,
        data.projectLocation || 'Prime Location',
      )
      .replace(
        /{{project\.startingPrice}}/gi,
        data.projectStartingPrice || '₹1.50 Cr',
      )
      .replace(/{{project\.brochureUrl}}/gi, data.projectBrochureUrl || '#')
      .replace(/{{agent\.name}}/gi, data.agentName || 'Sales Team')
      .replace(/{{agent\.phone}}/gi, data.agentPhone || '+91 98000 00000')
      .replace(/{{unsubscribeUrl}}/gi, data.unsubscribeUrl || '#unsubscribe');
  }

  async sendTestEmail(dto: SendTestEmailDto) {
    const providerType = dto.providerType || 'SYSTEM_DEFAULT';
    let credentials: ProviderCredentials | undefined;

    if (dto.integrationId) {
      const integration = await this.prisma.marketingIntegration.findUnique({
        where: { id: dto.integrationId },
      });
      if (integration) {
        credentials = this.mapCredentials(integration);
      }
    } else if (providerType !== 'SYSTEM_DEFAULT') {
      const activeIntegration =
        await this.prisma.marketingIntegration.findFirst({
          where: { provider: providerType as any, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      if (activeIntegration) {
        credentials = this.mapCredentials(activeIntegration);
      }
    }

    let project: any = null;
    if (dto.projectId) {
      project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { name: true, city: true, address: true, brochureUrl: true },
      });
    }

    const adapter = this.getAdapter(providerType);

    const resolvedFromEmail =
      dto.fromEmail &&
        dto.fromEmail.includes('@') &&
        dto.fromEmail !== 'marketing@example.com'
        ? dto.fromEmail
        : credentials?.fromEmail || dto.fromEmail || 'marketing@example.com';

    const resolvedFromName =
      dto.fromName || credentials?.fromName || 'Sales Team';

    const recipientEmail = (dto.recipientEmail || dto.toEmail || '').trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new BadRequestException(
        'A valid recipient email address is required',
      );
    }

    const testRecipientName = recipientEmail.split('@')[0];
    const previewData = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      fullName: 'Rahul Sharma',
      city: project?.city || 'Mumbai',
      projectName: project?.name || 'Luxury Villas',
      projectLocation:
        project?.address || project?.city || 'Prime Downtown Corridor',
      projectStartingPrice: '₹1.50 Cr',
      projectBrochureUrl:
        project?.brochureUrl || 'https://yourdomain.com/brochure',
      agentName: resolvedFromName,
      agentPhone: '+91 98000 00000',
      unsubscribeUrl: '#unsubscribe',
    };

    const subjectContent = dto.subject || 'Project Launch';
    const bodyContent = dto.htmlContent || '<p>Hello from BrokerOS</p>';

    const renderedSubject = this.renderMergeTags(subjectContent, previewData);
    const renderedHtml = this.renderMergeTags(bodyContent, previewData);

    const options: SendEmailOptions = {
      fromEmail: resolvedFromEmail,
      fromName: resolvedFromName,
      to: [{ email: recipientEmail, name: testRecipientName }],
      subject: `[TEST] ${renderedSubject}`,
      htmlContent: renderedHtml,
    };

    return adapter.sendBatch(options, credentials);
  }

  async listIntegrations() {
    return this.prisma.marketingIntegration.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: {
        senderDomains: {
          orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async connectIntegration(dto: ConnectIntegrationDto) {
    const adapter = this.getAdapter(dto.provider);
    const credentials = this.mapCredentials(dto);
    const isValid = await adapter.validateCredentials(credentials);

    if (!isValid) {
      throw new BadRequestException(
        `Failed to validate credentials with provider ${dto.provider}`,
      );
    }

    if (dto.isDefault) {
      await this.prisma.marketingIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await this.prisma.marketingIntegration.create({
      data: {
        provider: dto.provider as any,
        name: dto.name || `${dto.provider} Gateway`,
        isDefault: dto.isDefault || false,
        apiKey: dto.apiKey,
        awsAccessKeyId: dto.awsAccessKeyId,
        awsSecretKey: dto.awsSecretKey,
        awsRegion: dto.awsRegion,
        mailchimpServer: dto.mailchimpServer,
        mailgunDomain: dto.mailgunDomain,
        mailgunRegion: dto.mailgunRegion,
        oauthClientId: dto.oauthClientId,
        oauthClientSecret: dto.oauthClientSecret,
        oauthRefreshToken: dto.oauthRefreshToken,
        oauthTenantId: dto.oauthTenantId,
        googleAppPassword: dto.googleAppPassword,
        fromEmail: dto.fromEmail || 'marketing@example.com',
        fromName: dto.fromName || 'Sales Team',
        replyTo: dto.replyTo,
      },
    });

    // Auto-sync domains immediately upon connection
    try {
      await this.syncDomainsForIntegration(created.id);
    } catch {
      // Non-blocking sync failure on creation
    }

    return this.prisma.marketingIntegration.findUnique({
      where: { id: created.id },
      include: { senderDomains: true },
    });
  }

  async syncDomainsForIntegration(integrationId: string) {
    const integration = await this.prisma.marketingIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    const credentials = this.mapCredentials(integration);

    const adapter = this.getAdapter(integration.provider);
    let discovered: any[] = [];
    if (typeof (adapter as any).listVerifiedSenders === 'function') {
      try {
        discovered = await (adapter as any).listVerifiedSenders(credentials);
      } catch {
        discovered = [];
      }
    }

    // Upsert discovered identities
    for (const identity of discovered) {
      const email = (identity.fromEmail || identity.email || '').toLowerCase().trim();
      if (!email || !email.includes('@')) continue;

      const domain = identity.domain || email.split('@')[1] || '';
      const fromName = identity.fromName || identity.name || integration.fromName || 'Sales Team';
      const existing = await this.prisma.marketingSenderDomain.findFirst({
        where: { integrationId, fromEmail: email },
      });

      if (existing) {
        await this.prisma.marketingSenderDomain.update({
          where: { id: existing.id },
          data: {
            domain,
            fromName,
            isVerified: identity.isVerified ?? true,
          },
        });
      } else {
        await this.prisma.marketingSenderDomain.create({
          data: {
            integrationId,
            fromEmail: email,
            fromName,
            domain,
            isVerified: identity.isVerified ?? true,
            isActive: true,
            dailyQuota: 500,
            isWarmupMode: false,
          },
        });
      }
    }

    // Ensure the integration's default fromEmail is also recorded as a verified sender domain
    if (integration.fromEmail && integration.fromEmail.includes('@')) {
      const defaultEmail = integration.fromEmail.toLowerCase().trim();
      const exists = await this.prisma.marketingSenderDomain.findFirst({
        where: { integrationId, fromEmail: defaultEmail },
      });
      if (!exists) {
        let isDefaultVerified = discovered.some(
          (d: any) => (d.fromEmail || '').toLowerCase().trim() === defaultEmail,
        );
        if (!isDefaultVerified && typeof (adapter as any).verifySenderIdentity === 'function') {
          try {
            const v = await (adapter as any).verifySenderIdentity(defaultEmail, credentials);
            isDefaultVerified = Boolean(v.isVerified);
          } catch {
            isDefaultVerified = true;
          }
        }

        await this.prisma.marketingSenderDomain.create({
          data: {
            integrationId,
            fromEmail: defaultEmail,
            fromName: integration.fromName || 'Sales Team',
            domain: defaultEmail.split('@')[1] || '',
            isVerified: isDefaultVerified,
            isActive: true,
            dailyQuota: 500,
            isWarmupMode: false,
          },
        });
      }
    }

    return this.prisma.marketingSenderDomain.findMany({
      where: { integrationId },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addSenderDomain(integrationId: string, dto: AddSenderDomainDto) {
    const integration = await this.prisma.marketingIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    const email = dto.fromEmail.toLowerCase().trim();
    if (!email.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    const domain = dto.domain?.trim() || email.split('@')[1];

    const existing = await this.prisma.marketingSenderDomain.findFirst({
      where: { integrationId, fromEmail: email },
    });

    if (existing) {
      throw new BadRequestException(
        `Sender identity "${email}" already registered for this integration`,
      );
    }

    // Call provider adapter to verify the sender email/domain on the provider account
    const credentials = this.mapCredentials(integration);

    const adapter = this.getAdapter(integration.provider);
    let isProviderVerified = true;

    if (typeof (adapter as any).verifySenderIdentity === 'function') {
      try {
        const verifyRes = await (adapter as any).verifySenderIdentity(email, credentials);
        if (!verifyRes.isVerified) {
          throw new BadRequestException(
            verifyRes.reason ||
              `Email provider ${integration.provider} could not verify identity "${email}" on this account`,
          );
        }
        isProviderVerified = true;
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        // Non-fatal if provider endpoint was temporarily unreachable but email is syntactically valid
        isProviderVerified = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
    }

    return this.prisma.marketingSenderDomain.create({
      data: {
        integrationId,
        fromEmail: email,
        fromName: dto.fromName || integration.fromName || 'Sales Team',
        domain,
        replyTo: dto.replyTo || integration.replyTo,
        dailyQuota: dto.dailyQuota ?? 500,
        isWarmupMode: dto.isWarmupMode ?? false,
        isVerified: isProviderVerified,
        isActive: true,
      },
    });
  }

  async updateSenderDomain(domainId: string, dto: UpdateSenderDomainDto) {
    const domain = await this.prisma.marketingSenderDomain.findUnique({
      where: { id: domainId },
    });
    if (!domain) throw new NotFoundException('Sender domain not found');

    return this.prisma.marketingSenderDomain.update({
      where: { id: domainId },
      data: {
        fromName: dto.fromName !== undefined ? dto.fromName : domain.fromName,
        replyTo: dto.replyTo !== undefined ? dto.replyTo : domain.replyTo,
        dailyQuota:
          dto.dailyQuota !== undefined ? dto.dailyQuota : domain.dailyQuota,
        isWarmupMode:
          dto.isWarmupMode !== undefined
            ? dto.isWarmupMode
            : domain.isWarmupMode,
        isActive: dto.isActive !== undefined ? dto.isActive : domain.isActive,
      },
    });
  }

  async deleteSenderDomain(domainId: string) {
    const domain = await this.prisma.marketingSenderDomain.findUnique({
      where: { id: domainId },
    });
    if (!domain) throw new NotFoundException('Sender domain not found');

    // Check if domain is used in any active/scheduled campaigns
    const activeCampaignsCount = await this.prisma.campaignSenderPool.count({
      where: {
        senderDomainId: domainId,
        campaign: {
          status: { in: ['PROCESSING', 'SCHEDULED'] },
        },
      },
    });

    if (activeCampaignsCount > 0) {
      throw new BadRequestException(
        'Cannot delete sender domain while active or scheduled campaigns are using it',
      );
    }

    return this.prisma.marketingSenderDomain.delete({
      where: { id: domainId },
    });
  }

  async listAllActiveSenderDomains() {
    return this.prisma.marketingSenderDomain.findMany({
      where: { isActive: true },
      include: {
        integration: {
          select: {
            id: true,
            provider: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ integrationId: 'asc' }, { fromEmail: 'asc' }],
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.marketingIntegration.delete({ where: { id } });
  }
}
