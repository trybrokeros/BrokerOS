// ============================================================================
// BrokerOS — Inbound SMS Webhook Controller (All 4 Providers + Universal)
// ============================================================================

import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { SmsInboundService } from '../services/sms-inbound.service.js';
import {
  UniversalInboundSmsDto,
  SimulateInboundSmsReplyDto,
} from '../dto/sms-flows.dto.js';
import { TwilioSmsWebhookParser } from '@brokeros/int-sms-twilio';
import { AwsSnsWebhookParser } from '@brokeros/int-sms-aws-sns';
import { SinchSmsWebhookParser } from '@brokeros/int-sms-sinch';
import { GupshupWebhookParser } from '@brokeros/int-sms-gupshup';
import { InfobipSmsWebhookParser } from '@brokeros/int-sms-infobip';
import { VonageSmsWebhookParser } from '@brokeros/int-sms-vonage';
import { TelnyxSmsWebhookParser } from '@brokeros/int-sms-telnyx';
import { PlivoSmsWebhookParser } from '@brokeros/int-sms-plivo';
import { BirdSmsWebhookParser } from '@brokeros/int-sms-bird';

@Controller(['api/marketing/sms/inbound', 'api/marketing/sms/inbound-webhooks'])
export class SmsInboundController {
  constructor(private readonly inboundService: SmsInboundService) {}

  /**
   * Universal Inbound Webhook (Accepts standard JSON from custom forwarders, etc.)
   */
  @Public()
  @Post(['', 'inbound'])
  @HttpCode(200)
  async handleUniversalInbound(
    @Body() dto: UniversalInboundSmsDto,
    @Headers() headers: Record<string, any>,
  ) {
    return this.inboundService.handleInboundSms({
      ...dto,
      headers: dto.headers || headers,
    });
  }

  /**
   * Twilio Inbound SMS Webhook
   */
  @Public()
  @Post(['twilio', 'twilio/inbound'])
  @HttpCode(200)
  async handleTwilioInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = TwilioSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'TWILIO',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * AWS SNS / Pinpoint Inbound SMS Webhook
   */
  @Public()
  @Post(['aws-sns', 'aws-sns/inbound', 'sns', 'sns/inbound'])
  @HttpCode(200)
  async handleAwsSnsInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = AwsSnsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'AWS_SNS',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Sinch Inbound SMS Webhook
   */
  @Public()
  @Post(['sinch', 'sinch/inbound'])
  @HttpCode(200)
  async handleSinchInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = SinchSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'SINCH',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Gupshup Inbound SMS Webhook
   */
  @Public()
  @Post(['gupshup', 'gupshup/inbound'])
  @HttpCode(200)
  async handleGupshupInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = GupshupWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'GUPSHUP',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Infobip Inbound SMS Webhook
   */
  @Public()
  @Post(['infobip', 'infobip/inbound'])
  @HttpCode(200)
  async handleInfobipInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = InfobipSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'INFOBIP',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Vonage Inbound SMS Webhook
   */
  @Public()
  @Post(['vonage', 'vonage/inbound', 'nexmo', 'nexmo/inbound'])
  @HttpCode(200)
  async handleVonageInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = VonageSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'VONAGE',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Telnyx Inbound SMS Webhook
   */
  @Public()
  @Post(['telnyx', 'telnyx/inbound'])
  @HttpCode(200)
  async handleTelnyxInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = TelnyxSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'TELNYX',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Plivo Inbound SMS Webhook
   */
  @Public()
  @Post(['plivo', 'plivo/inbound'])
  @HttpCode(200)
  async handlePlivoInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = PlivoSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'PLIVO',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Bird Inbound SMS Webhook
   */
  @Public()
  @Post(['bird', 'bird/inbound', 'messagebird', 'messagebird/inbound'])
  @HttpCode(200)
  async handleBirdInbound(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const parsed = BirdSmsWebhookParser.parseInbound(headers, body);
    if (parsed) {
      return this.inboundService.handleInboundSms({
        from: parsed.fromPhone,
        to: parsed.toPhone || '',
        text: parsed.textBody,
        provider: 'BIRD',
        messageId: parsed.providerMsgId,
        headers,
      });
    }
    return { received: true, handled: false };
  }

  /**
   * Test Inbound Simulation Endpoint
   */
  @Public()
  @Post('simulate')
  @HttpCode(200)
  async simulateReply(@Body() dto: SimulateInboundSmsReplyDto) {
    return this.inboundService.simulateInboundReply(dto);
  }
}
