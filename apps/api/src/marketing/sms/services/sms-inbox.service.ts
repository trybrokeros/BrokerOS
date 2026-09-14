// ============================================================================
// BrokerOS — SMS Inbox Service (2-Way Team Inbox with Thread Continuity)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { SmsIntegrationsService } from './sms-integrations.service.js';
import { SmsAiService } from '../ai/sms-ai.service.js';
import { calculateSmsSegments } from '@brokeros/constants';
import type {
  ListSmsConversationsQueryDto,
  StartSmsConversationDto,
  SendSmsReplyDto,
  ListSmsMessagesQueryDto,
  DraftSmsAiReplyDto,
} from '../dto/sms-inbox.dto.js';
import type { SmsProviderCredentials } from '@brokeros/types';

const SMS_CONVERSATION_INCLUDE = {
  agent: {
    select: { id: true, name: true, email: true },
  },
  lead: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      temperature: true,
      budget: true,
      score: true,
      interestedProject: {
        select: { id: true, name: true },
      },
    },
  },
  campaign: {
    select: { id: true, title: true },
  },
};

@Injectable()
export class SmsInboxService {
  private readonly logger = new Logger(SmsInboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: SmsIntegrationsService,
    private readonly aiService: SmsAiService,
  ) {}

  /**
   * List paginated SMS conversations with status filtering and phone search.
   */
  async listConversations(query: ListSmsConversationsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.status && ['open', 'pending', 'closed'].includes(query.status)) {
      where.status = query.status;
    }

    if (query.agentId) {
      where.agentUserId = query.agentId;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { contactPhone: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { lastMessageText: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.smsConversation.findMany({
        where,
        include: SMS_CONVERSATION_INCLUDE,
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.smsConversation.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single conversation by ID
   */
  async getConversation(id: string) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id },
      include: SMS_CONVERSATION_INCLUDE,
    });

    if (!conv) {
      throw new NotFoundException(`SMS conversation #${id} not found`);
    }

    return conv;
  }

  /**
   * Get chronological messages in conversation
   */
  async getMessages(conversationId: string, query?: ListSmsMessagesQueryDto) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      throw new NotFoundException(`SMS conversation #${conversationId} not found`);
    }

    const messages = await this.prisma.smsMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      conversationId,
      items: messages,
      total: messages.length,
    };
  }

  /**
   * Start a new conversation or return existing active one
   */
  async startConversation(
    dto: StartSmsConversationDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const contactPhone = dto.contactPhone.trim();

    let lead: any = null;
    if (dto.leadId) {
      lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    }

    const contactName =
      dto.contactName ||
      (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : '') ||
      contactPhone;

    let existing = await this.prisma.smsConversation.findFirst({
      where: {
        contactPhone,
        isActive: true,
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: true,
      },
    });

    if (existing) {
      if (dto.initialMessage?.trim()) {
        await this.sendReply(
          existing.id,
          { text: dto.initialMessage.trim() },
          senderUser,
        );
      }
      return existing;
    }

    // Resolve default provider and sender number if not specified
    let provider = dto.assignedProvider;
    let senderPhone = dto.assignedSenderPhone || dto.assignedSenderId;

    if (!senderPhone || !provider) {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { isActive: true },
        include: { senderNumbers: { where: { isVerified: true }, orderBy: { createdAt: 'asc' } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (activeIntegration) {
        provider = provider || activeIntegration.provider;
        senderPhone = senderPhone || activeIntegration.senderNumbers[0]?.phoneNumber || activeIntegration.senderNumbers[0]?.senderId || activeIntegration.fromSender;
      }
    }

    if (!provider || !senderPhone) {
      throw new BadRequestException('No active SMS integration with verified sender number found. Please configure an SMS gateway in Settings.');
    }

    const created = await this.prisma.smsConversation.create({
      data: {
        contactPhone,
        contactName,
        leadId: dto.leadId || lead?.id || null,
        agentUserId: senderUser?.id || null,
        assignedProvider: provider,
        assignedSenderPhone: senderPhone,
        status: 'open',
        unreadCount: 0,
        lastMessageText: dto.initialMessage?.slice(0, 150) || 'Conversation started',
        lastMessageAt: new Date(),
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: true,
      },
    });

    if (dto.initialMessage?.trim()) {
      await this.sendReply(
        created.id,
        { text: dto.initialMessage.trim() },
        senderUser,
      );
    }

    return created;
  }

  /**
   * Send 2-way outbound reply strictly adhering to the Thread Continuity Invariant.
   * Dispatches strictly via the conversation's assignedProvider and assignedSenderPhone.
   */
  async sendReply(
    conversationId: string,
    dto: SendSmsReplyDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
      include: { lead: true },
    });

    if (!conv) {
      throw new NotFoundException(`SMS Conversation #${conversationId} not found`);
    }

    let textContent = dto.text?.trim() || '';
    if (dto.mediaUrl && !textContent.includes(dto.mediaUrl)) {
      textContent = textContent ? `${textContent}\n${dto.mediaUrl}` : dto.mediaUrl;
    }
    if (!textContent) {
      throw new BadRequestException('Message text or media cannot be empty');
    }

    const provider = conv.assignedProvider;
    let fromPhone: string | null | undefined = conv.assignedSenderPhone;

    if (!fromPhone) {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { ...(provider ? { provider: provider as any } : {}), isActive: true },
        include: { senderNumbers: { where: { isVerified: true }, orderBy: { createdAt: 'asc' } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      fromPhone =
        activeIntegration?.senderNumbers[0]?.phoneNumber ||
        activeIntegration?.senderNumbers[0]?.senderId ||
        activeIntegration?.fromSender ||
        null;
    }

    if (!fromPhone || !provider) {
      throw new BadRequestException(`No active verified sender phone found for SMS gateway ${provider || 'UNKNOWN'}.`);
    }
    const fromName = senderUser?.name || 'Sales Team';

    const { segments } = calculateSmsSegments(textContent);

    // Resolve provider credentials for the dedicated provider
    let credentials: SmsProviderCredentials | undefined;
    const integration = await this.prisma.smsIntegration.findFirst({
      where: { provider: provider as any, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    if (integration) {
      credentials = {
        accountSid: integration.accountSid || undefined,
        authToken: integration.authToken || undefined,
        messagingServiceSid: integration.messagingServiceSid || undefined,
        apiKey: integration.apiKey || undefined,
        servicePlanId: integration.servicePlanId || undefined,
        awsAccessKeyId: integration.awsAccessKeyId || undefined,
        awsSecretKey: integration.awsSecretKey || undefined,
        awsRegion: integration.awsRegion || undefined,
        dltEntityId: integration.dltEntityId || undefined,
        fromNumber: fromPhone,
        senderId: fromPhone,
      };
    }

    let providerMsgId: string | null = null;
    try {
      const adapter = this.integrationsService.getAdapter(provider);
      const sendRes = await adapter.sendBatch(
        {
          from: fromPhone,
          to: [{ phone: conv.contactPhone, name: conv.contactName || undefined }],
          message: textContent,
        },
        credentials,
      );

      providerMsgId = sendRes.providerMessageId || null;
      this.logger.log(
        `Inbox Outbound SMS dispatched via ${provider}: to=${conv.contactPhone} msgId=${providerMsgId}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to dispatch SMS via ${provider}: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException(`SMS delivery failed: ${err.message}`);
      }
    }

    const createdMessage = await this.prisma.smsMessage.create({
      data: {
        conversationId,
        direction: 'OUTBOUND',
        senderType: 'agent',
        senderName: fromName,
        fromPhone,
        toPhone: conv.contactPhone,
        bodyText: textContent,
        segmentsCount: segments,
        status: providerMsgId ? 'DELIVERED' : 'SENT',
        provider,
        providerMsgId: providerMsgId || `local-${Date.now()}`,
        sentAt: new Date(),
        deliveredAt: providerMsgId ? new Date() : null,
      },
    });

    await this.prisma.smsConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: textContent.slice(0, 160),
        lastMessageAt: new Date(),
        unreadCount: 0,
      },
    });

    return createdMessage;
  }

  async updateStatus(id: string, status: 'open' | 'pending' | 'closed') {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { status },
      include: SMS_CONVERSATION_INCLUDE,
    });
  }

  async assignAgent(id: string, agentUserId: string | null) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { agentUserId },
      include: SMS_CONVERSATION_INCLUDE,
    });
  }

  async toggleAiAutoReply(id: string, disabled: boolean) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { aiAutoReplyDisabled: disabled },
      include: SMS_CONVERSATION_INCLUDE,
    });
  }

  async markRead(id: string) {
    return this.prisma.smsConversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }

  async draftAiReply(conversationId: string, dto?: DraftSmsAiReplyDto) {
    const conv = await this.prisma.smsConversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true,
        campaign: true,
        lead: {
          include: {
            interestedProject: true,
            assignedUser: true,
          },
        },
      },
    });

    if (!conv) {
      throw new NotFoundException(`SMS Conversation #${conversationId} not found`);
    }

    const recentMessages = await this.prisma.smsMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const chronological = [...recentMessages].reverse();

    const leadName =
      dto?.leadName ||
      conv.contactName ||
      (conv.lead ? `${conv.lead.firstName || ''} ${conv.lead.lastName || ''}`.trim() : '') ||
      'Prospect';

    const advisorName =
      dto?.agentName ||
      conv.agent?.name ||
      conv.lead?.assignedUser?.name ||
      'Property Advisory Consultant';

    const campaignTitle = conv.campaign?.title || conv.lead?.interestedProject?.name || 'Luxury Residences';

    const aiRes = await this.aiService.generateAutoreply({
      leadName,
      advisorName,
      originalCampaignTitle: campaignTitle,
      project: conv.lead?.interestedProject
        ? {
            name: conv.lead.interestedProject.name,
            city: conv.lead.interestedProject.city || undefined,
            description: conv.lead.interestedProject.description || undefined,
          }
        : null,
      messages: chronological.map((m) => ({
        direction: m.direction,
        text: m.bodyText,
        senderName: m.senderName || undefined,
      })),
      customInstructions: dto?.instruction,
    });

    return {
      text: aiRes.text,
      modelUsed: aiRes.modelUsed,
    };
  }
}

