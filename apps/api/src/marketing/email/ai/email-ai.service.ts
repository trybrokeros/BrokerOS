// ============================================================================
// BrokerOS — Email AI Assistant & Autoreply Service (Groq openai/gpt-oss-120b)
// ============================================================================

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { encrypt, decrypt } from '@brokeros/int-whatsapp';
import type { SaveEmailAiConfigDto } from '../dto/email-flows.dto.js';

export interface EmailAiGenerateReplyArgs {
  leadName?: string;
  advisorName?: string;
  inboundSubject?: string;
  inboundBody?: string;
  originalCampaignTitle?: string;
  originalSubject?: string;
  project?: {
    name?: string;
    city?: string;
    address?: string;
    description?: string;
    amenities?: string[];
    brochureUrl?: string;
  } | null;
  messages?: Array<{
    direction: string;
    senderName?: string;
    subject?: string;
    bodyText: string;
  }>;
  customInstructions?: string;
}

@Injectable()
export class EmailAiService {
  private readonly logger = new Logger(EmailAiService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get active Email AI configuration. Masked API key.
   */
  async getAiConfig() {
    const config = await this.prisma.emailAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return {
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
        apiKey: null,
        systemPrompt: this.getDefaultSystemPrompt(),
        isActive: true,
        autoReplyEnabled: false,
        autoReplyMaxPerLead: 3,
      };
    }

    return {
      ...config,
      apiKey: config.apiKey ? '••••••••' : null,
    };
  }

  /**
   * Save or update Email AI configuration.
   */
  async saveAiConfig(dto: SaveEmailAiConfigDto) {
    const existing = await this.prisma.emailAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let encryptedKey = existing?.apiKey || '';
    if (dto.apiKey === '' || dto.apiKey === null) {
      encryptedKey = '';
    } else if (dto.apiKey && dto.apiKey !== '••••••••') {
      encryptedKey = encrypt(dto.apiKey.trim());
    }

    // Default to openai/gpt-oss-120b as requested
    const selectedModel =
      dto.model && dto.model.trim().length > 0
        ? dto.model.trim()
        : dto.provider === 'openai'
          ? 'gpt-4o-mini'
          : 'openai/gpt-oss-120b';

    const systemPrompt =
      dto.systemPrompt && dto.systemPrompt.trim().length > 0
        ? dto.systemPrompt
        : this.getDefaultSystemPrompt();

    if (existing) {
      return this.prisma.emailAiConfig.update({
        where: { id: existing.id },
        data: {
          provider: dto.provider || existing.provider || 'groq',
          model: selectedModel,
          apiKey: encryptedKey,
          systemPrompt,
          isActive: dto.isActive ?? existing.isActive,
          autoReplyEnabled: dto.autoReplyEnabled ?? existing.autoReplyEnabled,
          autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? existing.autoReplyMaxPerLead,
        },
      });
    }

    return this.prisma.emailAiConfig.create({
      data: {
        provider: dto.provider || 'groq',
        model: selectedModel,
        apiKey: encryptedKey,
        systemPrompt,
        isActive: dto.isActive ?? true,
        autoReplyEnabled: dto.autoReplyEnabled ?? false,
        autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? 3,
      },
    });
  }

  /**
   * Generates an intelligent real estate reply using Groq (openai/gpt-oss-120b)
   */
  async generateAutoreply(args: EmailAiGenerateReplyArgs): Promise<{
    subject: string;
    textBody: string;
    htmlBody: string;
  }> {
    const config = await this.prisma.emailAiConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    let provider = config?.provider || 'groq';
    let model = config?.model || 'openai/gpt-oss-120b';
    if (!model || model.includes('llama') || model.includes('mixtral')) {
      model = provider === 'groq' ? 'openai/gpt-oss-120b' : 'gpt-4o-mini';
    }
    let rawApiKey = '';

    if (config?.apiKey) {
      try {
        rawApiKey = decrypt(config.apiKey);
      } catch {
        this.logger.warn('Failed to decrypt custom Email AI key, falling back to .env');
      }
    }

    // Fallback to environment variables
    if (!rawApiKey) {
      if (process.env.GROQ_API_KEY) {
        provider = 'groq';
        rawApiKey = process.env.GROQ_API_KEY;
        if (!model || model.includes('llama') || model.includes('mixtral')) {
          model = 'openai/gpt-oss-120b';
        }
      } else if (process.env.OPENAI_API_KEY) {
        provider = 'openai';
        rawApiKey = process.env.OPENAI_API_KEY;
        model = 'gpt-4o-mini';
      }
    }

    // Build context entities
    const clientName = args.leadName || 'Valued Client';
    const advisorName = args.advisorName || 'Property Advisory Consultant';
    const projectName = args.project?.name || args.originalCampaignTitle || 'Our Premier Residential Project';
    const projectCity = args.project?.city || 'the prime city center';
    const amenities = args.project?.amenities?.join(', ') || 'Clubhouse, Swimming Pool, High-speed Elevators, 24/7 Security';

    const systemPrompt =
      config?.systemPrompt ||
      this.getDefaultSystemPrompt();

    const injectedSystemPrompt = `${systemPrompt}

REAL ESTATE CONTEXT:
- Brokerage: BrokerOS Realty & Advisory
- Advisor Name: ${advisorName}
- Project Name: ${projectName}
- City / Location: ${projectCity}
- Key Highlights & Amenities: ${amenities}
- Recipient / Client Name: ${clientName}
${args.project?.brochureUrl ? `- Digital Brochure Link: ${args.project.brochureUrl}` : ''}

CRITICAL RULES FOR EMAIL DRAFTS:
1. Tone: Warm, executive, courteous, and professional.
2. Context Sensitivity: If the client asked a question, answer it directly and concisely. Keep the body between 60 to 140 words unless detailed specifications are requested.
3. ABSOLUTELY ZERO PLACEHOLDERS:
   - CRITICAL: NEVER output placeholders such as [Your Name], **Your Name**, [Agent Name], [Company Name], [Phone Number], [Insert Link], etc.
   - Always sign off directly as:
     Warm regards,
     ${advisorName}
     BrokerOS Advisory Team
4. VARIETY: Provide fresh phrasing and a distinct tone each time.
5. FORMAT: Return your answer strictly as a JSON object with:
   {
     "subject": "accurate email subject line (e.g. Re: ...)",
     "body": "email body text in clean paragraphs"
   }
${args.customInstructions ? `\nADDITIONAL PERSONA INSTRUCTIONS:\n${args.customInstructions}` : ''}`.trim();

    let userPrompt = '';
    if (args.messages && args.messages.length > 0) {
      const threadHistory = args.messages
        .slice(-6)
        .map(
          (m) =>
            `${m.direction === 'INBOUND' ? `[Client: ${clientName}]` : `[Advisor: ${advisorName}]`}:\nSubject: ${m.subject || ''}\n${m.bodyText}`,
        )
        .join('\n\n---\n\n');

      userPrompt = `Ongoing email correspondence with client "${clientName}":

${threadHistory}

Draft the next email response from Advisor "${advisorName}" to client "${clientName}". Return strictly JSON: { "subject": "...", "body": "..." }.`;
    } else if (args.inboundBody) {
      userPrompt = `Inbound email from "${clientName}":
Subject: ${args.inboundSubject || args.originalSubject || 'Property Inquiry'}
Body:
"${args.inboundBody}"

Draft the next email reply from Advisor "${advisorName}". Return strictly JSON: { "subject": "...", "body": "..." }.`;
    } else {
      userPrompt = `Draft an initial outreach email to prospective homebuyer "${clientName}" from Advisor "${advisorName}" regarding ${projectName}.
Return strictly JSON: { "subject": "...", "body": "..." }.`;
    }

    if (rawApiKey) {
      try {
        const endpoint =
          provider === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${rawApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: injectedSystemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 600,
            temperature: 0.8,
          }),
          signal: AbortSignal.timeout(18000),
        });

        if (response.ok) {
          const resData = await response.json();
          const content = resData?.choices?.[0]?.message?.content?.trim() || '';

          let parsedSubject = '';
          let parsedBody = '';

          try {
            // Try extracting JSON block
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              parsedSubject = parsed.subject;
              parsedBody = parsed.body;
            }
          } catch {
            // Fallback: use raw text
          }

          if (!parsedBody) {
            parsedBody = content
              .replace(/```json[\s\S]*?```/g, '')
              .replace(/```[\s\S]*?```/g, '')
              .trim();
          }

          // Clean any stray placeholders
          parsedBody = parsedBody
            .replace(/\[Your Name\]/gi, advisorName)
            .replace(/\*\*Your Name\*\*/gi, advisorName)
            .replace(/\[Company Name\]/gi, 'BrokerOS Realty')
            .replace(/\[Phone Number\]/gi, '+1 800 BROKEROS');

          if (!parsedSubject) {
            parsedSubject = args.inboundSubject?.startsWith('Re:')
              ? args.inboundSubject
              : `Re: ${args.inboundSubject || args.originalSubject || projectName}`;
          }

          const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  ${parsedBody
    .split('\n\n')
    .map((p: string) => `<p style="margin-bottom: 12px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')}
</div>`;

          return {
            subject: parsedSubject,
            textBody: parsedBody,
            htmlBody,
          };
        }
      } catch (err: any) {
        this.logger.error(`AI generation failure: ${err?.message}`);
      }
    }

    // Dynamic contextual fallback
    const fallbackSubjects = [
      `Exclusive Insights: ${projectName} Details`,
      `Re: Your inquiry on ${projectName}`,
      `Floor Plans & Site Visit for ${clientName}`,
    ];
    const pickedSubject =
      args.inboundSubject?.startsWith('Re:')
        ? args.inboundSubject
        : args.inboundSubject
          ? `Re: ${args.inboundSubject}`
          : args.originalSubject || fallbackSubjects[Math.floor(Math.random() * fallbackSubjects.length)];

    const fallbackBodies = [
      `Hello ${clientName},\n\nThank you for connecting regarding ${projectName}. We have detailed floor plans and current availability ready for your review.\n\nWould you have 10 minutes this week for a brief call or a scheduled site walkthrough?\n\nWarm regards,\n${advisorName}\nBrokerOS Advisory Team`,
      `Dear ${clientName},\n\nFollowing up on our discussions regarding ${projectName}, I wanted to share our latest pricing options and payment schedules.\n\nPlease let me know if tomorrow or this weekend works best for a private tour.\n\nBest regards,\n${advisorName}\nBrokerOS Advisory Team`,
    ];
    const pickedBody = fallbackBodies[Math.floor(Math.random() * fallbackBodies.length)];

    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;">
  ${pickedBody
    .split('\n\n')
    .map((p) => `<p style="margin-bottom: 12px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')}
</div>`;

    return {
      subject: pickedSubject,
      textBody: pickedBody,
      htmlBody,
    };
  }

  /**
   * Alias for generateAutoreply
   */
  async generateAiReply(args: EmailAiGenerateReplyArgs) {
    return this.generateAutoreply(args);
  }

  private getDefaultSystemPrompt(): string {
    return `You are an elite real estate sales advisor and concierge for an enterprise brokerage.
Your role is to assist prospective buyers courteously, provide crisp property insights, answer pricing, configuration, and site visit scheduling queries, and encourage booking an on-site visit.`;
  }
}
