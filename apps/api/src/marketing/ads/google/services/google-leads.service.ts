import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { GoogleAdsApiClient } from '@brokeros/int-ads-google';

@Injectable()
export class GoogleLeadsService {
  private readonly logger = new Logger(GoogleLeadsService.name);
  private readonly client = new GoogleAdsApiClient();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes inbound webhook from Google Lead Form Asset.
   */
  async processLeadWebhook(payload: Record<string, any>) {
    try {
      this.logger.log('Processing inbound Google Ads lead webhook payload');

      const expectedKey =
        process.env.GOOGLE_ADS_WEBHOOK_KEY ||
        'brokeros_google_ads_lead_secret_2026';

      const isValid = this.client.verifyLeadWebhook(payload, expectedKey);
      if (!isValid) {
        this.logger.warn(
          'Google Ads webhook verification failed: Invalid or missing google_key',
        );
        return { success: false, error: 'Invalid or missing google_key' };
      }

      // Parse payload
      const leadData = this.client.parseLeadData(payload);
      const googleLeadId = leadData.leadId;
      const campaignId = leadData.campaignId;
      const formId = leadData.formId;
      const gclid = leadData.gclid;

      this.logger.log(
        `Received Google Lead: leadId=${googleLeadId}, campaignId=${campaignId || 'N/A'}, phone=${leadData.phoneNumber}`,
      );

      // Match integration
      let integration: any = null;
      if (campaignId) {
        const camp = await this.prisma.googleCampaignCache.findUnique({
          where: { id: campaignId },
        });
        if (camp) {
          integration = await this.prisma.googleAdIntegration.findUnique({
            where: { id: camp.integrationId },
          });
        }
      }

      if (!integration) {
        integration = await this.prisma.googleAdIntegration.findFirst({
          where: { isActive: true },
          orderBy: { isDefault: 'desc' },
        });
      }

      // Resolve LeadSource
      let leadSource = await this.prisma.leadSource.findFirst({
        where: { type: 'GOOGLE_ADS' },
      });

      if (!leadSource) {
        leadSource = await this.prisma.leadSource
          .create({
            data: {
              name: 'Google Search & PMax Ads',
              type: 'GOOGLE_ADS',
              isActive: true,
            },
          })
          .catch(() => null);
      }

      // Determine phone & name
      const phone = leadData.phoneNumber || `+9198111${googleLeadId.slice(-5)}`;
      const firstName = leadData.firstName || 'Google';
      const lastName = leadData.lastName || 'Prospect';
      const summaryText = `Generated via Google Lead Form Asset (${formId || 'N/A'}) on Campaign: ${campaignId || 'Search Campaign'}${gclid ? ` [GCLID: ${gclid}]` : ''}`;

      // Create or update Lead
      let crmLead = await this.prisma.lead.findFirst({
        where: { phone },
      });

      if (!crmLead) {
        crmLead = await this.prisma.lead.create({
          data: {
            firstName,
            lastName,
            phone,
            email: leadData.email || null,
            preferredLocation: leadData.city || null,
            budget: leadData.budget ? Number(leadData.budget) : null,
            sourceId: leadSource?.id || null,
            status: 'NEW',
            temperature: 'HOT',
            customerSummary: summaryText,
            requirements: leadData.customFields
              ? JSON.stringify(leadData.customFields)
              : undefined,
          },
        });
        this.logger.log(
          `Created new CRM Lead ${crmLead.id} from Google Ads Lead Form: ${firstName} ${lastName} (${phone})`,
        );
      } else {
        this.logger.log(
          `Existing CRM Lead found for ${phone}. Appending Google Ads inquiry summary.`,
        );
        await this.prisma.lead.update({
          where: { id: crmLead.id },
          data: {
            customerSummary: crmLead.customerSummary
              ? `${crmLead.customerSummary}\n\n[Google Ads Inbound] Repeated inquiry on campaign: ${campaignId || 'Google Ads'}`
              : `[Google Ads Inbound] Repeated inquiry on campaign: ${campaignId || 'Google Ads'}`,
          },
        });
      }

      // Record audit in GoogleLeadWebhookLog
      await this.prisma.googleLeadWebhookLog.create({
        data: {
          integrationId: integration?.id,
          campaignCacheId: campaignId || undefined,
          googleLeadId,
          formId,
          campaignId,
          gclid,
          leadId: crmLead.id,
          fieldData: leadData.customFields || {},
          rawPayload: payload,
          status: 'PROCESSED',
        },
      });

      return {
        success: true,
        googleLeadId,
        crmLeadId: crmLead.id,
      };
    } catch (err: any) {
      this.logger.error(
        `Exception during Google Lead webhook processing: ${err?.message}`,
        err?.stack,
      );
      return { success: false, error: err?.message };
    }
  }
}
