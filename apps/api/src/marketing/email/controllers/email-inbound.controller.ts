// ============================================================================
// BrokerOS — Inbound Email Webhook Controller (All 4 Providers + Universal)
// ============================================================================

import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { EmailInboundService } from '../services/email-inbound.service.js';
import { UniversalInboundEmailDto, SimulateInboundReplyDto } from '../dto/email-flows.dto.js';

@Controller(['api/marketing/email/inbound', 'api/marketing/email/webhooks'])
export class EmailInboundController {
  constructor(private readonly inboundService: EmailInboundService) {}

  /**
   * Universal Inbound Webhook (Accepts standard JSON from custom forwarders, Cloudflare, etc.)
   */
  @Public()
  @Post(['', 'inbound'])
  @HttpCode(200)
  async handleUniversalInbound(
    @Body() dto: UniversalInboundEmailDto,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.handleInboundEmail({
      ...dto,
      headers,
    });
  }

  /**
   * SendGrid Inbound Parse Webhook
   */
  @Public()
  @Post(['sendgrid', 'sendgrid/inbound'])
  @HttpCode(200)
  async handleSendgridInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseSendgridInbound(body, headers);
  }

  /**
   * AWS SES SNS Inbound Webhook
   */
  @Public()
  @Post(['ses', 'ses/inbound'])
  @HttpCode(200)
  async handleSesInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseSesInbound(body, headers);
  }

  /**
   * Brevo Inbound Webhook
   */
  @Public()
  @Post(['brevo', 'brevo/inbound'])
  @HttpCode(200)
  async handleBrevoInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseBrevoInbound(body, headers);
  }

  /**
   * Mailchimp / Mandrill Inbound Webhook
   */
  @Public()
  @Post(['mailchimp', 'mailchimp/inbound'])
  @HttpCode(200)
  async handleMailchimpInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseMailchimpInbound(body, headers);
  }

  /**
   * Mailgun Inbound Webhook
   */
  @Public()
  @Post(['mailgun', 'mailgun/inbound'])
  @HttpCode(200)
  async handleMailgunInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseMailgunInbound(body, headers);
  }

  /**
   * Gmail Push / Inbound Webhook
   */
  @Public()
  @Post(['gmail', 'gmail/inbound'])
  @HttpCode(200)
  async handleGmailInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseGmailInbound(body, headers);
  }

  /**
   * Microsoft 365 / Outlook Inbound Webhook
   */
  @Public()
  @Post(['outlook', 'outlook/inbound'])
  @HttpCode(200)
  async handleOutlookInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseOutlookInbound(body, headers);
  }

  /**
   * Constant Contact Inbound Webhook
   */
  @Public()
  @Post(['constant-contact', 'constant-contact/inbound'])
  @HttpCode(200)
  async handleConstantContactInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.parseConstantContactInbound(body, headers);
  }

  /**
   * Test Inbound Simulation Endpoint
   */
  @Public()
  @Post('simulate')
  @HttpCode(200)
  async simulateReply(@Body() dto: SimulateInboundReplyDto) {
    return this.inboundService.simulateInboundReply(dto);
  }
}
