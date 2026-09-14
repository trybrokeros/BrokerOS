// ============================================================================
// BrokerOS — Email Inbox Service (2-Way Team Inbox with Thread Continuity)
// ============================================================================

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailIntegrationsService } from './email-integrations.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import type {
  ListEmailConversationsQueryDto,
  StartEmailConversationDto,
  SendEmailReplyDto,
  ListEmailMessagesQueryDto,
  DraftEmailAiReplyDto,
} from '../dto/email-inbox.dto.js';
import type { ProviderCredentials } from '@brokeros/types';

@Injectable()
export class EmailInboxService {
  private readonly logger = new Logger(EmailInboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: EmailIntegrationsService,
    private readonly aiService: EmailAiService,
  ) {}

  /**
   * List paginated conversations with status filtering and text search.
   */
  async listConversations(query: ListEmailConversationsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    // Status filter: all | open | pending | closed
    if (query.status && ['open', 'pending', 'closed'].includes(query.status)) {
      where.status = query.status;
    }

    // Agent filter
    if (query.agentId) {
      where.agentUserId = query.agentId;
    }

    // Search filter
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { contactEmail: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { lastMessageText: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.emailConversation.findMany({
        where,
        include: {
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
            },
          },
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.emailConversation.count({ where }),
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
   * Get single conversation by ID with lead and agent profile
   */
  async getConversation(id: string) {
    const conv = await this.prisma.emailConversation.findUnique({
      where: { id },
      include: {
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
          },
        },
      },
    });

    if (!conv) {
      throw new NotFoundException(`Email conversation #${id} not found`);
    }

    return conv;
  }

  /**
   * Get chronological message thread for a conversation
   */
  async getMessages(conversationId: string, query?: ListEmailMessagesQueryDto) {
    const conv = await this.prisma.emailConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      throw new NotFoundException(`Email conversation #${conversationId} not found`);
    }

    const messages = await this.prisma.emailMessage.findMany({
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
   * Start a new conversation or return existing active one with a contact/lead
   */
  async startConversation(
    dto: StartEmailConversationDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const contactEmail = dto.contactEmail.trim().toLowerCase();

    // 1. If leadId provided, enrich details from CRM lead
    let lead: any = null;
    if (dto.leadId) {
      lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    }

    const contactName =
      dto.contactName ||
      (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : '') ||
      contactEmail.split('@')[0];

    // 2. Check for existing active conversation with this email
    let existing = await this.prisma.emailConversation.findFirst({
      where: {
        contactEmail: { equals: contactEmail, mode: 'insensitive' },
        isActive: true,
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
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
          },
        },
      },
    });

    if (existing) {
      // If initial message provided, dispatch it as a reply
      if (dto.initialMessage?.trim()) {
        await this.sendReply(
          existing.id,
          { text: dto.initialMessage.trim(), subject: dto.subject },
          senderUser,
        );
      }
      return existing;
    }

    // 3. Resolve default provider and sender identity if not specified
    let provider = dto.assignedProvider || 'SYSTEM_DEFAULT';
    let senderEmail = dto.assignedSenderEmail;

    if (!senderEmail) {
      const activeIntegration = await this.prisma.marketingIntegration.findFirst({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (activeIntegration) {
        provider = activeIntegration.provider;
        senderEmail = activeIntegration.fromEmail;
      } else {
        senderEmail = 'sales@brokeros.com';
      }
    }

    // 4. Create conversation record
    const created = await this.prisma.emailConversation.create({
      data: {
        contactEmail,
        contactName,
        subject: dto.subject,
        leadId: dto.leadId || lead?.id || null,
        agentUserId: senderUser?.id || null,
        assignedProvider: provider,
        assignedSenderEmail: senderEmail,
        assignedSenderName: senderUser?.name || 'Sales Team',
        status: 'open',
        unreadCount: 0,
        lastMessageText: dto.initialMessage?.slice(0, 150) || 'Conversation started',
        lastMessageAt: new Date(),
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
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
          },
        },
      },
    });

    // 5. If initial message provided, dispatch it immediately
    if (dto.initialMessage?.trim()) {
      await this.sendReply(
        created.id,
        { text: dto.initialMessage.trim(), subject: dto.subject },
        senderUser,
      );
    }

    return created;
  }

  /**
   * Send 2-way outbound reply with thread continuity.
   * Dispatches via the conversation's dedicated assignedProvider and assignedSenderEmail.
   */
  async sendReply(
    conversationId: string,
    dto: SendEmailReplyDto,
    senderUser?: { id: string; name?: string; email?: string },
  ) {
    const conv = await this.prisma.emailConversation.findUnique({
      where: { id: conversationId },
      include: { lead: true },
    });

    if (!conv) {
      throw new NotFoundException(`Conversation #${conversationId} not found`);
    }

    const textContent = dto.text?.trim() || '';
    const htmlContent =
      dto.html?.trim() ||
      textContent
        .split('\n')
        .map((p) => `<p style="margin:0 0 12px 0;line-height:1.5;">${p}</p>`)
        .join('');

    if (!textContent && !htmlContent) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const replySubject = dto.subject || (conv.subject?.startsWith('Re:') ? conv.subject : `Re: ${conv.subject || 'Inquiry'}`);
    const provider = conv.assignedProvider || 'SYSTEM_DEFAULT';
    const fromEmail = conv.assignedSenderEmail || 'sales@brokeros.com';
    const fromName = senderUser?.name || conv.assignedSenderName || 'Sales Team';

    // Find the latest inbound or outbound message in this thread for In-Reply-To header
    const lastMsg = await this.prisma.emailMessage.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });

    const inReplyTo = lastMsg?.providerMsgId || undefined;

    // Load credentials for the dedicated assignedProvider
    let credentials: ProviderCredentials | undefined;
    if (provider !== 'SYSTEM_DEFAULT') {
      const integration = await this.prisma.marketingIntegration.findFirst({
        where: { provider: provider as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (integration) {
        credentials = {
          apiKey: integration.apiKey || undefined,
          awsAccessKeyId: integration.awsAccessKeyId || undefined,
          awsSecretKey: integration.awsSecretKey || undefined,
          awsRegion: integration.awsRegion || undefined,
          mailchimpServer: integration.mailchimpServer || undefined,
          fromEmail: integration.fromEmail,
          fromName: integration.fromName,
        };
      }
    }

    // Dispatch email via provider adapter
    let providerMsgId: string | null = null;
    try {
      const adapter = this.integrationsService.getAdapter(provider);
      const sendRes = await adapter.sendBatch(
        {
          fromEmail,
          fromName,
          replyTo: fromEmail,
          to: [
            {
              email: conv.contactEmail,
              name: conv.contactName || conv.contactEmail.split('@')[0],
              leadId: conv.leadId || undefined,
            },
          ],
          subject: replySubject,
          htmlContent,
          plainTextContent: textContent,
          attachments: dto.attachments?.map((att) => ({
            filename: att.name,
            content: att.url,
            contentType: att.contentType || 'application/octet-stream',
          })),
        },
        credentials,
      );

      providerMsgId = sendRes.providerMessageId || null;
      this.logger.log(`Inbox Outbound Email dispatched via ${provider}: to=${conv.contactEmail} msgId=${providerMsgId}`);
    } catch (err: any) {
      this.logger.error(`Failed to dispatch email via ${provider}: ${err.message}`);
      // Record failed message or allow continuing in development
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException(`Email delivery failed: ${err.message}`);
      }
    }

    // Record outbound EmailMessage in thread
    const createdMessage = await this.prisma.emailMessage.create({
      data: {
        conversationId,
        direction: 'OUTBOUND',
        senderType: 'agent',
        senderName: fromName,
        fromEmail,
        toEmail: conv.contactEmail,
        subject: replySubject,
        bodyText: textContent,
        bodyHtml: htmlContent,
        status: providerMsgId ? 'DELIVERED' : 'SENT',
        provider,
        providerMsgId,
        inReplyTo,
        attachments: (dto.attachments as any) || undefined,
        sentAt: new Date(),
      },
    });

    // Update conversation summary
    await this.prisma.emailConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: textContent.slice(0, 180),
        lastMessageAt: new Date(),
        status: 'open',
      },
    });

    return createdMessage;
  }

  /**
   * Update conversation status: open | pending | closed
   */
  async updateStatus(id: string, status: 'open' | 'pending' | 'closed') {
    const updated = await this.prisma.emailConversation.update({
      where: { id },
      data: { status },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            temperature: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Assign or unassign agent to conversation
   */
  async assignAgent(id: string, agentUserId: string | null) {
    const updated = await this.prisma.emailConversation.update({
      where: { id },
      data: { agentUserId },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            temperature: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Mark conversation as read (resets unreadCount to 0)
   */
  async markRead(id: string) {
    return this.prisma.emailConversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }

  /**
   * Generate an AI-assisted draft reply based on conversation history
   */
  async draftAiReply(conversationId: string, dto?: DraftEmailAiReplyDto) {
    const conv = await this.prisma.emailConversation.findUnique({
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
      throw new NotFoundException(`Conversation #${conversationId} not found`);
    }

    // Get recent messages in thread (chronological order)
    const recentMessages = await this.prisma.emailMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
      conv.assignedSenderName ||
      conv.lead?.assignedUser?.name ||
      'Property Advisory Consultant';

    const campaignTitle =
      conv.campaign?.title || conv.lead?.interestedProject?.name || 'Exclusive Property Update';

    const projectInfo = conv.lead?.interestedProject
      ? {
          name: conv.lead.interestedProject.name,
          city: conv.lead.interestedProject.city || undefined,
          description: conv.lead.interestedProject.description || undefined,
        }
      : null;

    const latestSubject =
      chronological[chronological.length - 1]?.subject ||
      conv.subject ||
      `Inquiry regarding ${campaignTitle}`;

    const aiRes = await this.aiService.generateAutoreply({
      leadName,
      advisorName,
      originalSubject: latestSubject,
      originalCampaignTitle: campaignTitle,
      project: projectInfo,
      messages: chronological.map((m) => ({
        direction: m.direction,
        senderName: m.senderName || undefined,
        subject: m.subject || undefined,
        bodyText: m.bodyText || '',
      })),
      customInstructions: dto?.instruction,
    });

    return {
      subject: aiRes.subject,
      textBody: aiRes.textBody,
      htmlBody: aiRes.htmlBody,
    };
  }
}

