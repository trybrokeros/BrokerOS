import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  getVoiceTelephonyProvider,
  getVoiceAgentProvider,
} from '@brokeros/int-voice';
import type {
  ConnectVoiceTelephonyDto,
  ConnectVoiceAgentDto,
} from '../dto/voice.dto.js';

@Injectable()
export class VoiceIntegrationsService {
  private readonly logger = new Logger(VoiceIntegrationsService.name);
  public readonly prisma = prismaClient;

  // ── Telephony Gateways ──

  async getTelephonyIntegrations() {
    const items = await this.prisma.voiceTelephonyIntegration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item,
      fromNumbers: Array.from(
        new Set((item.fromNumbers || []).map((n) => n.trim())),
      ).filter(Boolean),
    }));
  }

  async connectTelephony(dto: ConnectVoiceTelephonyDto) {
    const provider = getVoiceTelephonyProvider(dto.provider, {
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      apiKey: dto.apiKey,
      apiToken: dto.apiToken,
      subdomain: dto.subdomain,
      sipDomain: dto.sipDomain,
    });

    const isValid = await provider.validateCredentials({
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      apiKey: dto.apiKey,
      apiToken: dto.apiToken,
      subdomain: dto.subdomain,
      sipDomain: dto.sipDomain,
    });

    if (!isValid) {
      throw new BadRequestException(
        `Failed to validate credentials with telephony carrier ${dto.provider}. Please verify your Account SID, Auth Token / API Key, and carrier permissions.`,
      );
    }

    if (dto.isDefault) {
      await this.prisma.voiceTelephonyIntegration.updateMany({
        data: { isDefault: false },
      });
    }

    const uniqueNumbers = Array.from(
      new Set((dto.fromNumbers || []).map((n) => n.trim())),
    ).filter(Boolean);

    return this.prisma.voiceTelephonyIntegration.create({
      data: {
        provider: dto.provider,
        name: dto.name,
        accountSid: dto.accountSid,
        authToken: dto.authToken,
        apiKey: dto.apiKey,
        apiToken: dto.apiToken,
        subdomain: dto.subdomain,
        sipDomain: dto.sipDomain,
        fromNumbers: uniqueNumbers,
        isDefault: dto.isDefault ?? false,
        isActive: true,
      },
    });
  }

  async verifyTelephony(id: string) {
    const integration = await this.prisma.voiceTelephonyIntegration.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundException(`Telephony Gateway ${id} not found`);
    }

    const provider = getVoiceTelephonyProvider(integration.provider, {
      accountSid: integration.accountSid || undefined,
      authToken: integration.authToken || undefined,
      apiKey: integration.apiKey || undefined,
      apiToken: integration.apiToken || undefined,
      subdomain: integration.subdomain || undefined,
      sipDomain: integration.sipDomain || undefined,
    });

    const startTime = Date.now();
    const isValid = await provider.validateCredentials({
      accountSid: integration.accountSid || undefined,
      authToken: integration.authToken || undefined,
      apiKey: integration.apiKey || undefined,
      apiToken: integration.apiToken || undefined,
      subdomain: integration.subdomain || undefined,
      sipDomain: integration.sipDomain || undefined,
    });
    const latencyMs = Date.now() - startTime;

    return {
      id: integration.id,
      provider: integration.provider,
      isValid,
      latencyMs,
      fromNumbersCount: (integration.fromNumbers || []).length,
      verifiedAt: new Date().toISOString(),
    };
  }

  async deleteTelephony(id: string) {
    await this.prisma.voiceCampaign.updateMany({
      where: { telephonyId: id },
      data: { telephonyId: null },
    });
    return this.prisma.voiceTelephonyIntegration.delete({
      where: { id },
    });
  }

  // ── AI Voice Agent Platforms ──

  async getAgentIntegrations() {
    return this.prisma.voiceAgentIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async connectAgent(dto: ConnectVoiceAgentDto) {
    const provider = getVoiceAgentProvider(dto.platform, {
      apiKey: dto.apiKey,
      orgId: dto.orgId,
      serverUrl: dto.serverUrl,
    });

    const isValid = await provider.validateCredentials({
      apiKey: dto.apiKey,
      orgId: dto.orgId,
      serverUrl: dto.serverUrl,
    });

    if (!isValid) {
      throw new BadRequestException(
        `Failed to validate credentials with AI voice platform ${dto.platform}. Please verify your API Key and workspace access.`,
      );
    }

    if (dto.isDefault) {
      await this.prisma.voiceAgentIntegration.updateMany({
        data: { isDefault: false },
      });
    }

    return this.prisma.voiceAgentIntegration.create({
      data: {
        platform: dto.platform,
        name: dto.name,
        apiKey: dto.apiKey,
        orgId: dto.orgId,
        serverUrl: dto.serverUrl,
        isDefault: dto.isDefault ?? false,
        isActive: true,
      },
    });
  }

  async verifyAgent(id: string) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundException(`AI Voice Platform ${id} not found`);
    }

    const provider = getVoiceAgentProvider(integration.platform, {
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    });

    const startTime = Date.now();
    const isValid = await provider.validateCredentials({
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    });
    const latencyMs = Date.now() - startTime;

    const catalog = await this.getPlatformCatalog(integration.platform, integration.id);

    return {
      id: integration.id,
      platform: integration.platform,
      isValid,
      latencyMs,
      assistantsCount: catalog.assistants?.length || 0,
      modelsCount: catalog.models?.length || 0,
      voicesCount: catalog.voices?.length || 0,
      verifiedAt: new Date().toISOString(),
    };
  }

  async deleteAgent(id: string) {
    await this.prisma.voiceCampaign.updateMany({
      where: { agentPlatformId: id },
      data: { agentPlatformId: null },
    });
    return this.prisma.voiceAgentIntegration.delete({
      where: { id },
    });
  }

  async getPlatformCatalog(platform: string, integrationId?: string) {
    let credentials: any = undefined;
    const normalizedPlatform = platform.toUpperCase() as any;

    if (integrationId) {
      const integration = await this.prisma.voiceAgentIntegration.findUnique({
        where: { id: integrationId },
      });
      if (integration) {
        credentials = {
          apiKey: integration.apiKey,
          orgId: integration.orgId || undefined,
          serverUrl: integration.serverUrl || undefined,
        };
      }
    } else {
      const defaultIntegration =
        await this.prisma.voiceAgentIntegration.findFirst({
          where: { platform: normalizedPlatform, isActive: true },
          orderBy: { isDefault: 'desc' },
        });
      if (defaultIntegration) {
        credentials = {
          apiKey: defaultIntegration.apiKey,
          orgId: defaultIntegration.orgId || undefined,
          serverUrl: defaultIntegration.serverUrl || undefined,
        };
      }
    }

    try {
      const provider = getVoiceAgentProvider(
        normalizedPlatform,
        credentials,
      ) as any;
      const [models, voices, assistants] = await Promise.all([
        provider.getAvailableModels
          ? provider.getAvailableModels(credentials).catch(() => [])
          : Promise.resolve([]),
        provider.getAvailableVoices
          ? provider.getAvailableVoices(credentials).catch(() => [])
          : Promise.resolve([]),
        provider.getAccountAssistants
          ? provider.getAccountAssistants(credentials).catch(() => [])
          : Promise.resolve([]),
      ]);

      return {
        platform: normalizedPlatform,
        models,
        voices,
        assistants: Array.isArray(assistants) ? assistants : [],
      };
    } catch {
      return {
        platform: normalizedPlatform,
        models: [],
        voices: [],
        assistants: [],
      };
    }
  }

  async getRemoteAssistants(integrationId: string) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) {
      throw new NotFoundException(`Voice Agent Integration ${integrationId} not found`);
    }

    const credentials = {
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    };

    const provider = getVoiceAgentProvider(integration.platform, credentials) as any;
    if (provider.getAccountAssistants) {
      return provider.getAccountAssistants(credentials);
    }
    return [];
  }

  async createRemoteAssistant(integrationId: string, payload: { name: string; config?: any }) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) {
      throw new NotFoundException(`Voice Agent Integration ${integrationId} not found`);
    }

    const credentials = {
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    };

    const provider = getVoiceAgentProvider(integration.platform, credentials) as any;
    if (!provider.createRemoteAssistant) {
      throw new BadRequestException(
        `Provider ${integration.platform} does not support remote assistant creation via API`,
      );
    }

    return provider.createRemoteAssistant(
      payload.name,
      payload.config || {},
      credentials,
    );
  }

  async updateRemoteAssistant(
    integrationId: string,
    assistantId: string,
    config: any,
  ) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) {
      throw new NotFoundException(`Voice Agent Integration ${integrationId} not found`);
    }

    const credentials = {
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    };

    const provider = getVoiceAgentProvider(integration.platform, credentials) as any;
    if (!provider.updateRemoteAssistant) {
      throw new BadRequestException(
        `Provider ${integration.platform} does not support remote assistant updates via API`,
      );
    }

    return provider.updateRemoteAssistant(assistantId, config, credentials);
  }

  async deleteRemoteAssistant(integrationId: string, assistantId: string) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) {
      throw new NotFoundException(`Voice Agent Integration ${integrationId} not found`);
    }

    const credentials = {
      apiKey: integration.apiKey,
      orgId: integration.orgId || undefined,
      serverUrl: integration.serverUrl || undefined,
    };

    const provider = getVoiceAgentProvider(integration.platform, credentials) as any;
    if (!provider.deleteRemoteAssistant) {
      throw new BadRequestException(
        `Provider ${integration.platform} does not support remote assistant deletion via API`,
      );
    }

    const success = await provider.deleteRemoteAssistant(assistantId, credentials);
    return { success };
  }

  // ── Platform Phone Numbers ───────────────────────────────────────────────────

  /**
   * Returns phone numbers registered inside the platform workspace (Vapi, Retell, ElevenLabs)
   * for a given VoiceAgentIntegration. Used by direct test dialers to select caller ID.
   */
  async getVapiPhoneNumbers(integrationId: string) {
    const integration = await this.prisma.voiceAgentIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) {
      throw new NotFoundException(`Voice AI Integration ${integrationId} not found`);
    }

    const platform = (integration.platform || '').toUpperCase();

    // 1. RETELL AI Phone Numbers
    if (platform === 'RETELL') {
      try {
        const res = await fetch('https://api.retellai.com/list-phone-numbers', {
          headers: { Authorization: `Bearer ${integration.apiKey}` },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          this.logger.error(`Retell phone-number list failed (${res.status}): ${text}`);
          return [];
        }
        const numbers = (await res.json()) as any[];
        if (!Array.isArray(numbers)) return [];

        return numbers.map((n: any) => ({
          id: n.phone_number,
          number: n.phone_number_pretty || n.phone_number,
          name: n.nickname || n.phone_number_pretty || n.phone_number,
          provider: 'retell',
        }));
      } catch (err: any) {
        this.logger.error(`Failed to fetch Retell phone numbers: ${err.message}`);
        return [];
      }
    }

    // 2. ELEVENLABS Phone Numbers
    if (platform === 'ELEVENLABS') {
      try {
        const res = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
          headers: { 'xi-api-key': integration.apiKey },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          this.logger.error(`ElevenLabs phone-number list failed (${res.status}): ${text}`);
          return [];
        }
        const numbers = (await res.json()) as any[];
        if (!Array.isArray(numbers)) return [];

        return numbers.map((n: any) => ({
          id: n.phone_number_id || n.phone_number,
          number: n.phone_number,
          name: n.label || n.phone_number,
          provider: 'elevenlabs',
        }));
      } catch (err: any) {
        this.logger.error(`Failed to fetch ElevenLabs phone numbers: ${err.message}`);
        return [];
      }
    }

    // 3. VAPI Phone Numbers (Default)
    try {
      const res = await fetch('https://api.vapi.ai/phone-number', {
        headers: { Authorization: `Bearer ${integration.apiKey}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        this.logger.error(`Vapi phone-number list failed (${res.status}): ${text}`);
        return [];
      }

      const numbers = (await res.json()) as any[];
      if (!Array.isArray(numbers)) return [];

      return numbers.map((n: any) => ({
        id: n.id,
        number: n.number || n.phoneNumber || n.e164Number || n.id,
        provider: n.provider || (n.twilioPhoneNumber ? 'twilio' : (n.vonagePhoneNumber ? 'vonage' : 'vapi')),
        name: n.name || n.number || n.id,
      }));
    } catch (err: any) {
      this.logger.error(`Failed to fetch Vapi phone numbers: ${err.message}`);
      return [];
    }
  }
}

