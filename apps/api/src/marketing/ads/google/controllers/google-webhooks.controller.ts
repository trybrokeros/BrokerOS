import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { GoogleLeadsService } from '../services/google-leads.service.js';
import { GoogleAdsApiClient } from '@brokeros/int-ads-google';

@Controller('api/marketing/ads/google/webhooks')
export class GoogleWebhooksController {
  private readonly client = new GoogleAdsApiClient();

  constructor(private readonly googleLeadsService: GoogleLeadsService) {}

  /**
   * Inbound Webhook handler for Google Ads Lead Form Asset submissions.
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleInboundLead(@Body() payload: any) {
    const expectedKey =
      process.env.GOOGLE_ADS_WEBHOOK_KEY ||
      'brokeros_google_ads_lead_secret_2026';

    const isValid = this.client.verifyLeadWebhook(payload, expectedKey);
    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid or missing google_key in Google Ads webhook payload',
      );
    }

    // Process asynchronously so Google receives 200 OK immediately
    this.googleLeadsService.processLeadWebhook(payload).catch(() => {});

    return { status: 'EVENT_RECEIVED' };
  }
}
