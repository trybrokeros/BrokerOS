import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Body,
  Query,
  Header,
  HttpStatus,
  HttpCode,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { VoiceTrackingService } from '../services/voice-tracking.service.js';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { VoiceAgentPlatform } from '@brokeros/types';

@Public()
@Controller('api/marketing/voice/webhooks')
export class VoiceWebhooksController {
  constructor(private readonly trackingService: VoiceTrackingService) {}

  @Get('vobiz-answer')
  @Post('vobiz-answer')
  @Header('Content-Type', 'text/xml')
  handleVobizAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('firstMessage') firstMessage?: string,
    @Query('agent') agentPlatform?: string,
    @Query('voice') voiceId?: string,
    @Res({ passthrough: true }) res?: Response,
  ): string {
    if (res) {
      res.type('text/xml');
    }

    // FIX #1087: Vobiz streams raw audio via a webhook URL that returns XML.
    // The old code dialled sip:assistant@sip.vapi.ai which fails unless the user
    // has configured a BYO SIP trunk in their Vapi organisation (almost never done).
    // Now we always use the bidirectional WebSocket media-stream bridge for ALL
    // AI platforms (Vapi, Retell, and generic) so audio actually flows to the engine.
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const wsUrl = publicUrl.replace(/^http/i, 'ws') + '/voice/stream';
    const plat = (agentPlatform || 'OPENAI_REALTIME').toUpperCase();

    // Vobiz / generic carrier — bidirectional WebSocket media stream to voice gateway
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="campaignId" value="${campaignId || 'direct_test'}"/>
      <Parameter name="recipientId" value="${recipientId || ''}"/>
      <Parameter name="agent" value="${plat}"/>
      <Parameter name="voiceId" value="${voiceId || 'alloy'}"/>
    </Stream>
  </Connect>
</Response>`;
  }

  @Get('twilio-answer')
  @Post('twilio-answer')
  @Header('Content-Type', 'text/xml')
  handleTwilioAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('firstMessage') firstMessage?: string,
    @Query('agent') agentPlatform?: string,
    @Query('voice') voiceId?: string,
    @Res({ passthrough: true }) res?: Response,
  ): string {
    if (res) {
      res.type('text/xml');
    }

    // FIX #1087: Twilio answer webhook — same fix as Vobiz. The SIP dial approach
    // (sip:assistant@sip.vapi.ai) fails with SIP 404/403 unless the user has
    // manually imported a BYO SIP trunk into their Vapi workspace. Using the
    // WebSocket media stream is the officially supported integration path.
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const wsUrl = publicUrl.replace(/^http/i, 'ws') + '/voice/stream';
    const plat = (agentPlatform || 'OPENAI_REALTIME').toUpperCase();

    // Twilio Bi-directional Media Stream Response (valid for all AI platforms)
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="campaignId" value="${campaignId || 'direct_test'}"/>
      <Parameter name="recipientId" value="${recipientId || ''}"/>
      <Parameter name="agent" value="${plat}"/>
      <Parameter name="voiceId" value="${voiceId || 'alloy'}"/>
    </Stream>
  </Connect>
</Response>`;
  }

  @Get('telnyx-answer')
  @Post('telnyx-answer')
  @Header('Content-Type', 'text/xml')
  handleTelnyxAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('firstMessage') firstMessage?: string,
    @Query('agent') agentPlatform?: string,
    @Query('voice') voiceId?: string,
    @Res({ passthrough: true }) res?: Response,
  ): string {
    // FIX #1087: Telnyx answer webhook — same SIP fix as Vobiz/Twilio.
    // Telnyx TeXML supports <Connect><Stream> for bidirectional audio; use it.
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const wsUrl = publicUrl.replace(/^http/i, 'ws') + '/voice/stream';
    const plat = (agentPlatform || 'OPENAI_REALTIME').toUpperCase();

    if (res) {
      res.type('text/xml');
    }

    // Telnyx TeXML bidirectional media stream — valid for all AI platforms
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="campaignId" value="${campaignId || 'direct_call'}"/>
      <Parameter name="recipientId" value="${recipientId || ''}"/>
      <Parameter name="agent" value="${plat}"/>
      <Parameter name="voiceId" value="${voiceId || 'alloy'}"/>
    </Stream>
  </Connect>
</Response>`;
  }

  // FIX #1087: Added Exotel answer webhook. Exotel delivers a StatusCallback POST;
  // we respond with XML that bridges audio to the voice gateway WebSocket stream.
  @Get('exotel-answer')
  @Post('exotel-answer')
  @Header('Content-Type', 'text/xml')
  handleExotelAnswer(
    @Query('campaignId') campaignId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('agent') agentPlatform?: string,
    @Query('voice') voiceId?: string,
    @Res({ passthrough: true }) res?: Response,
  ): string {
    if (res) {
      res.type('text/xml');
    }
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const wsUrl = publicUrl.replace(/^http/i, 'ws') + '/voice/stream';
    const plat = (agentPlatform || 'OPENAI_REALTIME').toUpperCase();

    // Exotel "Say" + "Stream" combo: greet, then stream audio to AI gateway
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="campaignId" value="${campaignId || 'direct_call'}"/>
      <Parameter name="recipientId" value="${recipientId || ''}"/>
      <Parameter name="agent" value="${plat}"/>
      <Parameter name="voiceId" value="${voiceId || 'alloy'}"/>
    </Stream>
  </Connect>
</Response>`;
  }

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') providerName: string,
    @Headers() headers: Record<string, any>,
    @Query() query: Record<string, any>,
    @Body() body: any,
    @Res({ passthrough: true }) res?: Response,
  ) {
    // 1. Dedicated Handler for Twilio Answer Webhook
    if (providerName === 'twilio-answer') {
      return this.handleTwilioAnswer(
        query.campaignId,
        query.recipientId,
        query.firstMessage,
        query.agent,
        query.voice,
        res,
      );
    }

    // 2. Dedicated Handler for Vobiz Answer Webhook
    if (providerName === 'vobiz-answer') {
      return this.handleVobizAnswer(
        query.campaignId,
        query.recipientId,
        query.firstMessage,
        query.agent,
        query.voice,
        res,
      );
    }

    // 3. Dedicated Handler for Telnyx Answer Webhook
    if (providerName === 'telnyx-answer') {
      return this.handleTelnyxAnswer(
        query.campaignId,
        query.recipientId,
        query.firstMessage,
        query.agent,
        query.voice,
        res,
      );
    }

    // 4. Voice Agent Platform Webhook Events (Vapi, Retell, ElevenLabs, Sarvam)
    const platform = providerName.toUpperCase() as VoiceAgentPlatform;

    // Webhook authorization verification (if configured in environment)
    const voiceSecret = process.env.VOICE_WEBHOOK_SECRET;
    if (voiceSecret) {
      const incomingSecret =
        headers['x-voice-secret'] ||
        headers['x-vapi-secret'] ||
        headers['authorization'];
      const normalized = incomingSecret?.replace(/^Bearer\s+/i, '');
      if (!incomingSecret || normalized !== voiceSecret) {
        throw new UnauthorizedException('Invalid voice webhook secret');
      }
    }

    try {
      const provider = getVoiceAgentProvider(platform);
      const events = provider.parseWebhookEvent(headers, body);

      if (events.length > 0) {
        await this.trackingService.processWebhookEvents(events);
      }

      return { success: true, processed: events.length };
    } catch {
      return { success: true };
    }
  }
}
