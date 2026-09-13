import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { EmailService } from '../email.service.js';
import { SesWebhookParser } from '@brokeros/int-mail-ses';
import { SendgridWebhookParser } from '@brokeros/int-mail-sendgrid';
import { BrevoWebhookParser } from '@brokeros/int-mail-brevo';
import { MailchimpWebhookParser } from '@brokeros/int-mail-mailchimp';
import { MailgunWebhookParser } from '@brokeros/int-mail-mailgun';
import { GmailWebhookParser } from '@brokeros/int-mail-gmail';
import { OutlookWebhookParser } from '@brokeros/int-mail-outlook';
import { ConstantContactWebhookParser } from '@brokeros/int-mail-constant-contact';

@Controller('api/marketing/webhooks')
export class EmailWebhooksController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('ses')
  @HttpCode(200)
  async handleSesWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = SesWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('sendgrid')
  @HttpCode(200)
  async handleSendgridWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = SendgridWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('brevo')
  @HttpCode(200)
  async handleBrevoWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = BrevoWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('mailchimp')
  @HttpCode(200)
  async handleMailchimpWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = MailchimpWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('mailgun')
  @HttpCode(200)
  async handleMailgunWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = MailgunWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('gmail')
  @HttpCode(200)
  async handleGmailWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = GmailWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('outlook')
  @HttpCode(200)
  async handleOutlookWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = OutlookWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }

  @Public()
  @Post('constant-contact')
  @HttpCode(200)
  async handleConstantContactWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const events = ConstantContactWebhookParser.parse(headers, body);
    if (events.length > 0) {
      await this.emailService.processWebhookEvents(events);
    }
    return { status: 'ok', processed: events.length };
  }
}
