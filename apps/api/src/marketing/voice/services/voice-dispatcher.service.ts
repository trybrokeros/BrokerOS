// ============================================================================
// BrokerOS — Voice Dispatcher Service (Carrier Line Tests & AI Preview Calls)
// ============================================================================
//
// testMode routing:
//   "vapi-direct"    → Skip carrier bridge, call api.vapi.ai/call directly.
//   "carrier-bridge" → Route through selected CRM telephony (Vobiz/Twilio/Exotel).
//   undefined        → Default: carrier bridge first, then Vapi direct fallback.

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  getVoiceTelephonyProvider,
  getVoiceAgentProvider,
  tryCarrierBridgeDispatch,
} from '@brokeros/int-voice';
import {
  normalizeVoiceLeadVariables,
  interpolateVoiceTemplate,
} from '@brokeros/constants';
import type {
  TestTelephonyCarrierDto,
  TestVoiceAiCallDto,
} from '../dto/voice.dto.js';
import type {
  VoiceTelephonyCredentials,
  VoiceAgentCredentials,
  SendVoiceOptions,
} from '@brokeros/types';

@Injectable()
export class VoiceDispatcherService {
  private readonly logger = new Logger(VoiceDispatcherService.name);
  private readonly prisma = prismaClient;

  async testCarrierLine(dto: TestTelephonyCarrierDto) {
    const integration = await this.prisma.voiceTelephonyIntegration.findUnique({
      where: { id: dto.telephonyId },
    });

    if (!integration) {
      throw new NotFoundException(
        `Telephony Gateway ${dto.telephonyId} not found`,
      );
    }

    const creds: VoiceTelephonyCredentials = {
      accountSid: integration.accountSid || undefined,
      authToken: integration.authToken || undefined,
      apiKey: integration.apiKey || undefined,
      apiToken: integration.apiToken || undefined,
      subdomain: integration.subdomain || undefined,
      sipDomain: integration.sipDomain || undefined,
    };

    const provider = getVoiceTelephonyProvider(integration.provider, creds);
    const fromNumber =
      dto.fromNumber || integration.fromNumbers[0] || '+14155550199';

    return provider.testCarrierCall(dto.toPhone, fromNumber, creds);
  }

  async testVoiceAiCall(dto: TestVoiceAiCallDto) {
    const isDirectMode =
      dto.testMode === 'vapi-direct' ||
      dto.testMode === 'retell-direct' ||
      dto.testMode === 'elevenlabs-direct' ||
      dto.testMode === 'direct';

    let telephony = dto.telephonyId
      ? await this.prisma.voiceTelephonyIntegration.findUnique({
        where: { id: dto.telephonyId },
      })
      : null;

    if (!telephony && !isDirectMode) {
      telephony = await this.prisma.voiceTelephonyIntegration.findFirst({
        where: { isActive: true },
        orderBy: { isDefault: 'desc' },
      });
    }

    let agent = dto.agentPlatformId
      ? await this.prisma.voiceAgentIntegration.findUnique({
        where: { id: dto.agentPlatformId },
      })
      : null;

    if (!agent && dto.voiceProvider) {
      const provUpper = dto.voiceProvider.toUpperCase();
      agent = await this.prisma.voiceAgentIntegration.findFirst({
        where: { platform: provUpper as any, isActive: true },
        orderBy: { isDefault: 'desc' },
      });
    }

    if (!agent) {
      agent = await this.prisma.voiceAgentIntegration.findFirst({
        where: { isActive: true },
        orderBy: { isDefault: 'desc' },
      });
    }

    if (!isDirectMode && !telephony) {
      throw new NotFoundException(
        'No active Telephony Gateway configured. Please connect Twilio, Vobiz, or Exotel in Voice Settings, or use Direct PSTN.',
      );
    }
    if (!agent) {
      throw new NotFoundException(
        'No active Voice AI Platform configured. Please connect Vapi, Retell, ElevenLabs, or Sarvam in Voice Settings.',
      );
    }

    const telephonyCreds: VoiceTelephonyCredentials = {
      provider: telephony?.provider,
      accountSid: telephony?.accountSid || undefined,
      authToken: telephony?.authToken || undefined,
      apiKey: telephony?.apiKey || undefined,
      apiToken: telephony?.apiToken || undefined,
      subdomain: telephony?.subdomain || undefined,
      sipDomain: telephony?.sipDomain || undefined,
      fromNumbers: telephony?.fromNumbers || [],
    };

    const agentCreds: VoiceAgentCredentials = {
      apiKey: agent.apiKey,
      orgId: agent.orgId || undefined,
      serverUrl: agent.serverUrl || undefined,
    };

    const voiceAgentProvider = getVoiceAgentProvider(
      agent.platform,
      agentCreds,
    );
    const validDids = telephony?.fromNumbers || [];
    const fromNumber =
      dto.fromNumber
        ? dto.fromNumber
        : validDids[0] || '';

    // Resolve project details dynamically from database if project is selected
    let project: any = null;
    if (dto.projectId) {
      project = await this.prisma.project
        .findUnique({
          where: { id: dto.projectId },
          select: { name: true, city: true, address: true },
        })
        .catch(() => null);
    }

    const dynamicVariables = normalizeVoiceLeadVariables(
      {
        phone: dto.toPhone,
        ...(dto.variables || {}),
      },
      project || undefined,
    );

    const resolvedFirstMessage = interpolateVoiceTemplate(
      dto.firstMessage,
      dynamicVariables,
    );
    const resolvedScriptPrompt = interpolateVoiceTemplate(
      dto.scriptPrompt,
      dynamicVariables,
    );

    const sendOptions: SendVoiceOptions = {
      toPhone: dto.toPhone,
      fromNumber,
      campaignId: 'test_preview_call',
      assistantId: dto.assistantId,
      llmModel: dto.llmModel,
      voiceProvider: dto.voiceProvider,
      voiceId: dto.voiceId,
      scriptPrompt: resolvedScriptPrompt,
      firstMessage: resolvedFirstMessage,
      telephonyCredentials: telephonyCreds,
      agentCredentials: agentCreds,
      variables: dynamicVariables,
      transcriberModel: dto.transcriberModel,
      transcriberLanguage: dto.transcriberLanguage,
      maxTurnSilenceMs: dto.maxTurnSilenceMs,
      voiceSpeed: dto.voiceSpeed,
      firstMessageMode: dto.firstMessageMode,
      voicemailDetection: dto.voicemailDetection,
      backgroundSound: dto.backgroundSound,
      maxDurationSeconds: dto.maxDurationSeconds,
      voiceModel: dto.retellVoiceModel,
      voiceEmotion: dto.retellEmotion,
      enableExpressiveMode: dto.enableExpressiveMode,
      ambientSound: dto.retellAmbientSound,
      language: dto.retellLanguage,
      enableBackchannel: dto.retellBackchannel,
      reminderTriggerMs: dto.retellReminderMs,
    };

    // ── Route by testMode ──────────────────────────────────────────────────────

    // OPTION A: Direct PSTN via AI Agent Platform (Vapi / Retell / ElevenLabs Direct)
    if (isDirectMode) {
      this.logger.log(
        `[${dto.testMode || 'direct'}] Dispatching outbound call to ${dto.toPhone} via ${agent.platform} API directly`,
      );
      const result = await voiceAgentProvider.dispatchOutboundCall(
        sendOptions,
        agentCreds,
      );
      if (!result.success) {
        this.logger.error(
          `[${dto.testMode || 'direct'}] ${agent.platform} outbound call failed: ${result.error}`,
        );
      }
      return result;
    }

    // OPTION B: CRM Telephony Carrier Bridge (Vobiz / Exotel / Twilio / Telnyx)
    this.logger.log(
      `[carrier-bridge] Dispatching outbound call to ${dto.toPhone} via carrier ${telephony?.provider || 'Unknown'} on ${agent.platform}`,
    );
    const carrierBridge = await tryCarrierBridgeDispatch(
      agent.platform,
      sendOptions,
    );
    if (carrierBridge.handled && carrierBridge.result) {
      if (!carrierBridge.result.success) {
        this.logger.error(
          `[carrier-bridge] Carrier ${telephony?.provider || 'Unknown'} failed: ${carrierBridge.result.error}`,
        );
      }
      return carrierBridge.result;
    }

    return {
      success: false,
      error: `Carrier line for ${telephony?.provider || 'selected telephony'} could not be dispatched. Please verify carrier credentials and registered numbers.`,
    };
  }
}
