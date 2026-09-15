// ============================================================================
// BrokerOS — Voice Dispatcher Service (Carrier Line Tests & AI Preview Calls)
// ============================================================================

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
    let telephony = dto.telephonyId
      ? await this.prisma.voiceTelephonyIntegration.findUnique({
        where: { id: dto.telephonyId },
      })
      : null;

    if (!telephony) {
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

    if (!agent) {
      agent = await this.prisma.voiceAgentIntegration.findFirst({
        where: { isActive: true },
        orderBy: { isDefault: 'desc' },
      });
    }

    if (!telephony) {
      throw new NotFoundException(
        'No active Telephony Gateway configured. Please connect Twilio, Vobiz, or Exotel in Voice Settings.',
      );
    }
    if (!agent) {
      throw new NotFoundException(
        'No active Voice AI Platform configured. Please connect Vapi, Retell, Sarvam, or Bolna in Voice Settings.',
      );
    }

    const telephonyCreds: VoiceTelephonyCredentials = {
      accountSid: telephony.accountSid || undefined,
      authToken: telephony.authToken || undefined,
      apiKey: telephony.apiKey || undefined,
      apiToken: telephony.apiToken || undefined,
      subdomain: telephony.subdomain || undefined,
      sipDomain: telephony.sipDomain || undefined,
      fromNumbers: telephony.fromNumbers,
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
    const validDids = telephony.fromNumbers || [];
    const fromNumber =
      dto.fromNumber && validDids.includes(dto.fromNumber)
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

    // 1. Try centralized carrier bridge dispatch (Vobiz, Exotel, Twilio, Telnyx)
    const carrierBridge = await tryCarrierBridgeDispatch(
      agent.platform,
      sendOptions,
    );
    if (carrierBridge.handled && carrierBridge.result?.success) {
      return carrierBridge.result;
    }

    const primaryResult =
      carrierBridge.handled && carrierBridge.result
        ? carrierBridge.result
        : await voiceAgentProvider.dispatchOutboundCall(
          sendOptions,
          agentCreds,
        );
    if (primaryResult.success) return primaryResult;

    // Carrier Failover: If primary dispatch failed, attempt secondary active telephony line
    const fallbackTelephony =
      await this.prisma.voiceTelephonyIntegration.findFirst({
        where: { isActive: true, id: { not: telephony.id } },
        orderBy: { isDefault: 'desc' },
      });

    if (fallbackTelephony) {
      this.logger.warn(
        `Primary carrier ${telephony.provider} failed: ${primaryResult.error}. Attempting failover to ${fallbackTelephony.provider}...`,
      );
      const fallbackCreds: VoiceTelephonyCredentials = {
        accountSid: fallbackTelephony.accountSid || undefined,
        authToken: fallbackTelephony.authToken || undefined,
        apiKey: fallbackTelephony.apiKey || undefined,
        apiToken: fallbackTelephony.apiToken || undefined,
        fromNumbers: fallbackTelephony.fromNumbers,
      };
      sendOptions.telephonyCredentials = fallbackCreds;
      sendOptions.fromNumber = fallbackTelephony.fromNumbers?.[0] || fromNumber;
      return voiceAgentProvider.dispatchOutboundCall(sendOptions, agentCreds);
    }

    return primaryResult;
  }
}
