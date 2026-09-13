// ============================================================================
// BrokerOS — Inbound Email Parsing & Identity Resolution Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailAutomationEngineService } from '../automations/email-automation-engine.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import type { UniversalInboundEmailDto, SimulateInboundReplyDto } from '../dto/email-flows.dto.js';

@Injectable()
export class EmailInboundService {
  private readonly logger = new Logger(EmailInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: EmailAutomationEngineService,
    private readonly aiService: EmailAiService,
  ) { }

  /**
   * Universal processor for parsed inbound emails.
   */
  async handleInboundEmail(dto: UniversalInboundEmailDto) {
    const fromEmail = this.cleanEmail(dto.from);
    const toEmail = this.cleanEmail(dto.to);
    const subject = dto.subject || 'No Subject';
    const body = dto.text || dto.html?.replace(/<[^>]*>?/gm, '') || '';
    const provider = dto.provider || 'UNIVERSAL';
    const providerMsgId = dto.messageId;
    const inReplyTo = dto.inReplyTo;

    this.logger.log(`Received Inbound Email via ${provider}: from=${fromEmail} to=${toEmail}`);

    // 1. Resolve CampaignRecipient by envelope and previous thread
    let matchedRecipient = await this.prisma.campaignRecipient.findFirst({
      where: {
        email: { equals: fromEmail, mode: 'insensitive' },
        ...(toEmail ? { assignedSenderEmail: { equals: toEmail, mode: 'insensitive' } } : {}),
      },
      include: {
        campaign: {
          include: { project: true },
        },
        lead: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    // Fallback: match by In-Reply-To providerMsgId
    if (!matchedRecipient && inReplyTo) {
      matchedRecipient = await this.prisma.campaignRecipient.findFirst({
        where: { providerMsgId: inReplyTo },
        include: {
          campaign: { include: { project: true } },
          lead: true,
        },
      });
    }

    // Fallback: match by sender email only (most recent broadcast)
    if (!matchedRecipient) {
      matchedRecipient = await this.prisma.campaignRecipient.findFirst({
        where: { email: { equals: fromEmail, mode: 'insensitive' } },
        include: {
          campaign: { include: { project: true } },
          lead: true,
        },
        orderBy: { sentAt: 'desc' },
      });
    }

    // 2. Audit record in EmailInboundMessage
    const inboundLog = await this.prisma.emailInboundMessage.create({
      data: {
        fromEmail,
        toEmail,
        subject,
        textBody: dto.text || body,
        htmlBody: dto.html,
        headers: (dto.headers as any) || {},
        provider,
        providerMsgId,
        inReplyTo,
        matchedRecipientId: matchedRecipient?.id || null,
        matchedCampaignId: matchedRecipient?.campaignId || null,
        matchedLeadId: matchedRecipient?.leadId || null,
        status: matchedRecipient ? 'PROCESSED' : 'UNMATCHED',
      },
    });

    // 3. Sync to 2-Way Email Team Inbox (EmailConversation & EmailMessage)
    try {
      let conversation = await this.prisma.emailConversation.findFirst({
        where: {
          contactEmail: { equals: fromEmail, mode: 'insensitive' },
          isActive: true,
        },
      });

      const contactName =
        matchedRecipient?.name ||
        (matchedRecipient?.lead
          ? `${matchedRecipient.lead.firstName || ''} ${matchedRecipient.lead.lastName || ''}`.trim()
          : null) ||
        fromEmail.split('@')[0];

      if (!conversation) {
        conversation = await this.prisma.emailConversation.create({
          data: {
            contactEmail: fromEmail,
            contactName,
            subject: subject || 'New Inquiry',
            leadId: matchedRecipient?.leadId || null,
            campaignId: matchedRecipient?.campaignId || null,
            recipientId: matchedRecipient?.id || null,
            assignedProvider: matchedRecipient?.assignedProvider || provider || 'SYSTEM_DEFAULT',
            assignedSenderEmail: toEmail || matchedRecipient?.assignedSenderEmail || 'sales@brokeros.com',
            assignedSenderName: matchedRecipient?.campaign?.fromName || 'Sales Team',
            status: 'open',
            unreadCount: 1,
            lastMessageText: body.slice(0, 180) || 'New inbound email',
            lastMessageAt: new Date(),
          },
        });
      } else {
        conversation = await this.prisma.emailConversation.update({
          where: { id: conversation.id },
          data: {
            unreadCount: { increment: 1 },
            lastMessageText: body.slice(0, 180) || 'New inbound reply',
            lastMessageAt: new Date(),
            status: 'open',
            ...(matchedRecipient?.leadId && !conversation.leadId ? { leadId: matchedRecipient.leadId } : {}),
            ...(matchedRecipient?.assignedProvider ? { assignedProvider: matchedRecipient.assignedProvider } : {}),
            ...(toEmail ? { assignedSenderEmail: toEmail } : {}),
          },
        });
      }

      // Record inbound EmailMessage
      await this.prisma.emailMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'INBOUND',
          senderType: 'contact',
          senderName: contactName,
          fromEmail,
          toEmail,
          subject,
          bodyText: dto.text || body,
          bodyHtml: dto.html,
          status: 'DELIVERED',
          provider,
          providerMsgId,
          inReplyTo,
          sentAt: new Date(),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to sync inbound email to EmailConversation: ${err.message}`);
    }

    // 4. Dispatch to Email Automation Engine
    const automationResult = await this.automationEngine.processInboundReply({
      inboundId: inboundLog.id,
      fromEmail,
      toEmail,
      subject,
      body,
      headers: dto.headers,
      provider,
      providerMsgId,
      inReplyTo,
      recipient: matchedRecipient,
    });

    // 5. If automation produced an outbound reply, record it in thread as a bot reply
    if (automationResult.outboundReply) {
      try {
        const conv = await this.prisma.emailConversation.findFirst({
          where: { contactEmail: { equals: fromEmail, mode: 'insensitive' } },
        });
        if (conv) {
          await this.prisma.emailMessage.create({
            data: {
              conversationId: conv.id,
              direction: 'OUTBOUND',
              senderType: 'bot',
              senderName: 'Automated Bot',
              fromEmail: conv.assignedSenderEmail || toEmail,
              toEmail: fromEmail,
              subject: `Re: ${subject}`,
              bodyText: automationResult.outboundReply,
              bodyHtml: `<p>${automationResult.outboundReply.replace(/\n/g, '<br/>')}</p>`,
              status: 'SENT',
              provider: conv.assignedProvider,
              isAiGenerated: true,
              sentAt: new Date(),
            },
          });
          await this.prisma.emailConversation.update({
            where: { id: conv.id },
            data: {
              lastMessageText: automationResult.outboundReply.slice(0, 180),
              lastMessageAt: new Date(),
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`Failed to record bot reply to EmailMessage: ${err.message}`);
      }
    }

    return {
      status: 'ok',
      inboundId: inboundLog.id,
      matchedRecipientId: matchedRecipient?.id || null,
      matchedCampaignTitle: matchedRecipient?.campaign?.title || null,
      assignedProvider: matchedRecipient?.assignedProvider || null,
      assignedSenderEmail: matchedRecipient?.assignedSenderEmail || null,
      actionsExecuted: automationResult.actionsExecuted,
      matchedFlowId: automationResult.matchedFlowId,
      flowName: automationResult.flowName,
      outboundReply: automationResult.outboundReply,
    };
  }

  /**
   * Parse SendGrid Inbound Parse payload (multipart/form-data)
   */
  async parseSendgridInbound(body: any, headers?: any) {
    const from = body?.from || '';
    const to = body?.to || '';
    const subject = body?.subject || '';
    const text = body?.text || '';
    const html = body?.html || '';
    const messageId = headers?.['message-id'] || body?.['message-id'];
    const inReplyTo = headers?.['in-reply-to'] || body?.['in-reply-to'];

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'SENDGRID',
      headers,
    });
  }

  /**
   * Parse AWS SES SNS inbound receipt event
   */
  async parseSesInbound(body: any, headers?: any) {
    // SES sends SNS notification with Message JSON string or raw email
    let payload = body;
    if (typeof body === 'string') {
      try {
        payload = JSON.parse(body);
      } catch {
        payload = body;
      }
    }

    const mail = payload?.mail || payload?.Message?.mail || {};
    const from = mail?.source || mail?.commonHeaders?.from?.[0] || '';
    const to = mail?.destination?.[0] || mail?.commonHeaders?.to?.[0] || '';
    const subject = mail?.commonHeaders?.subject || '';
    const messageId = mail?.messageId;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text: payload?.content || subject,
      messageId,
      provider: 'AWS_SES',
      headers,
    });
  }

  /**
   * Parse Brevo Inbound Webhook payload
   */
  async parseBrevoInbound(body: any, headers?: any) {
    const from = body?.from?.email || body?.sender?.email || body?.from || '';
    const to = body?.to?.[0]?.email || body?.recipient || body?.to || '';
    const subject = body?.subject || '';
    const text = body?.text || body?.content || '';
    const html = body?.html || '';
    const messageId = body?.['message-id'] || body?.messageId;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      provider: 'BREVO',
      headers,
    });
  }

  /**
   * Parse Mailchimp / Mandrill Inbound events
   */
  async parseMailchimpInbound(body: any, headers?: any) {
    let events = body?.mandrill_events;
    if (typeof events === 'string') {
      try {
        events = JSON.parse(events);
      } catch {
        events = [];
      }
    }

    if (Array.isArray(events) && events.length > 0) {
      const first = events[0]?.msg || {};
      const from = first?.from_email || '';
      const to = first?.email || '';
      const subject = first?.subject || '';
      const text = first?.text || '';
      const html = first?.html || '';
      const messageId = first?._id;

      return this.handleInboundEmail({
        from,
        to,
        subject,
        text,
        html,
        messageId,
        provider: 'MAILCHIMP',
        headers,
      });
    }

    return this.handleInboundEmail({
      from: body?.from_email || body?.from || '',
      to: body?.to_email || body?.to || '',
      subject: body?.subject || '',
      text: body?.text || '',
      html: body?.html || '',
      provider: 'MAILCHIMP',
      headers,
    });
  }

  /**
   * Parse Mailgun Inbound Webhook payload
   */
  async parseMailgunInbound(body: any, headers?: any) {
    const from = body?.from || body?.sender || '';
    const to = body?.recipient || body?.to || '';
    const subject = body?.subject || '';
    const text = body?.['stripped-text'] || body?.['body-plain'] || body?.text || '';
    const html = body?.['stripped-html'] || body?.['body-html'] || body?.html || '';
    const messageId = headers?.['message-id'] || body?.['Message-Id'] || body?.['message-id'] || body?.id;
    const inReplyTo = headers?.['in-reply-to'] || body?.['In-Reply-To'] || body?.['in-reply-to'];

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'MAILGUN',
      headers,
    });
  }

  /**
   * Parse Gmail Inbound Push / Webhook payload
   */
  async parseGmailInbound(body: any, headers?: any) {
    let parsedBody = body;
    // Handle Cloud Pub/Sub base64 payload if wrapped
    if (body?.message?.data && typeof body.message.data === 'string') {
      try {
        const decoded = Buffer.from(body.message.data, 'base64').toString('utf8');
        parsedBody = JSON.parse(decoded);
      } catch {
        // use original body if decoding fails
      }
    }

    const from = parsedBody?.from || parsedBody?.sender || parsedBody?.emailAddress || '';
    const to = parsedBody?.to || parsedBody?.recipient || '';
    const subject = parsedBody?.subject || '';
    const text = parsedBody?.text || parsedBody?.snippet || parsedBody?.body || '';
    const html = parsedBody?.html || '';
    const messageId = headers?.['message-id'] || parsedBody?.messageId || parsedBody?.id;
    const inReplyTo = headers?.['in-reply-to'] || parsedBody?.inReplyTo || parsedBody?.threadId;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'GMAIL',
      headers,
    });
  }

  /**
   * Parse Microsoft 365 / Outlook Inbound Webhook payload
   */
  async parseOutlookInbound(body: any, headers?: any) {
    // If MS Graph notification with resourceData
    const item = Array.isArray(body?.value) ? body.value[0]?.resourceData || body.value[0] : body;

    const from =
      item?.from?.emailAddress?.address ||
      item?.sender?.emailAddress?.address ||
      item?.from ||
      item?.sender ||
      '';
    const to =
      (Array.isArray(item?.toRecipients) ? item.toRecipients[0]?.emailAddress?.address : null) ||
      item?.to ||
      item?.recipient ||
      '';
    const subject = item?.subject || '';
    const text = item?.body?.content || item?.text || item?.bodyPreview || '';
    const html = item?.body?.contentType === 'html' ? item.body.content : item?.html;
    const messageId = headers?.['message-id'] || item?.internetMessageId || item?.id;
    const inReplyTo = headers?.['in-reply-to'] || item?.conversationId || item?.inReplyTo;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'OUTLOOK',
      headers,
    });
  }

  /**
   * Parse Constant Contact Inbound Webhook payload
   */
  async parseConstantContactInbound(body: any, headers?: any) {
    const from = body?.from || body?.email_address || body?.contact_email || '';
    const to = body?.to || body?.recipient || '';
    const subject = body?.subject || '';
    const text = body?.text || body?.content || '';
    const html = body?.html || '';
    const messageId = headers?.['message-id'] || body?.activity_id || body?.id;
    const inReplyTo = headers?.['in-reply-to'] || body?.campaign_id;

    return this.handleInboundEmail({
      from,
      to,
      subject,
      text,
      html,
      messageId,
      inReplyTo,
      provider: 'CONSTANT_CONTACT',
      headers,
    });
  }

  /**
   * Live Test Simulator: Injects a test lead reply without DNS MX setup
   */
  async simulateInboundReply(dto: SimulateInboundReplyDto) {
    const fromEmail = this.cleanEmail(dto.leadEmail) || 'prospect-tester@example.com';
    const toEmail = this.cleanEmail(dto.senderEmail) || 'sales@brokeros.com';

    const automationResult = await this.automationEngine.processInboundReply({
      fromEmail,
      toEmail,
      subject: dto.subject,
      body: dto.bodyText,
      provider: 'SIMULATOR',
      forceFlowId: dto.flowId,
      isSimulation: true,
    });

    const outputText =
      automationResult.outboundReply ||
      (automationResult.actionsExecuted?.length ? automationResult.actionsExecuted.join('\n') : null) ||
      'Inbound simulation processed with no outbound action.';

    return {
      status: 'ok',
      matchedFlowId: automationResult.matchedFlowId || null,
      flowName: automationResult.flowName || null,
      triggerMatched: automationResult.triggerMatched ?? true,
      triggerReason: automationResult.triggerReason || null,
      actionsExecuted: automationResult.actionsExecuted || [],
      outboundReply: automationResult.outboundReply || null,
      renderedSubject: automationResult.renderedSubject || null,
      renderedBody: automationResult.renderedBody || automationResult.outboundReply || null,
      summary: outputText,
      output: {
        text: outputText,
        subject: automationResult.renderedSubject || dto.subject,
        html: automationResult.renderedBody
          ? `<p>${automationResult.renderedBody.replace(/\n/g, '<br/>')}</p>`
          : null,
      },
    };
  }

  private cleanEmail(raw: string): string {
    if (!raw) return '';
    const match = raw.match(/<([^>]+)>/);
    const email = match ? match[1] : raw;
    return email.toLowerCase().trim();
  }
}
