// ============================================================================
// BrokerOS — SMS AI Assistant & Autoreply Service (Groq openai/gpt-oss-120b)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { encrypt, decrypt } from '@brokeros/int-whatsapp';
import type { SaveSmsAiConfigDto } from '../dto/sms-flows.dto.js';

export interface SmsAiGenerateReplyArgs {
  leadName?: string;
  advisorName?: string;
  inboundBody?: string;
  originalCampaignTitle?: string;
  project?: {
    name?: string;
    city?: string;
    address?: string;
    description?: string;
    amenities?: string[];
    brochureUrl?: string;
  } | null;
  messages?: Array<{ direction: string; text: string; senderName?: string }>;
  customInstructions?: string;
}

@Injectable()
export class SmsAiService {
  private readonly logger = new Logger(SmsAiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active SMS AI configuration. Masked API key.
   */
  async getAiConfig() {
    const config = await this.prisma.smsAiConfig.findFirst({
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
        maxCharacters: 160,
      };
    }

    return {
      ...config,
      apiKey: config.apiKey ? '••••••••' : null,
    };
  }

  /**
   * Save or update SMS AI configuration.
   */
  async saveAiConfig(dto: SaveSmsAiConfigDto) {
    const existing = await this.prisma.smsAiConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let encryptedKey = existing?.apiKey || '';
    if (dto.apiKey === '' || dto.apiKey === null) {
      encryptedKey = '';
    } else if (dto.apiKey && dto.apiKey !== '••••••••') {
      encryptedKey = encrypt(dto.apiKey.trim());
    }

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
      return this.prisma.smsAiConfig.update({
        where: { id: existing.id },
        data: {
          provider: dto.provider || existing.provider || 'groq',
          model: selectedModel,
          apiKey: encryptedKey,
          systemPrompt,
          isActive: dto.isActive ?? existing.isActive,
          autoReplyEnabled: dto.autoReplyEnabled ?? existing.autoReplyEnabled,
          autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? existing.autoReplyMaxPerLead,
          maxCharacters: dto.maxCharacters ?? existing.maxCharacters,
        },
      });
    }

    return this.prisma.smsAiConfig.create({
      data: {
        provider: dto.provider || 'groq',
        model: selectedModel,
        apiKey: encryptedKey,
        systemPrompt,
        isActive: dto.isActive ?? true,
        autoReplyEnabled: dto.autoReplyEnabled ?? false,
        autoReplyMaxPerLead: dto.autoReplyMaxPerLead ?? 3,
        maxCharacters: dto.maxCharacters ?? 160,
      },
    });
  }

  /**
   * Generate an automated SMS reply using Groq LPU inference.
   * Strictly enforces character brevity <= 160 chars.
   */
  async generateAutoreply(args: SmsAiGenerateReplyArgs): Promise<{
    text: string;
    modelUsed: string;
  }> {
    const config = await this.prisma.smsAiConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    let apiKey = '';
    if (config?.apiKey) {
      try {
        apiKey = decrypt(config.apiKey);
      } catch {
        apiKey = '';
      }
    }

    if (!apiKey) {
      apiKey = process.env.GROQ_API_KEY || '';
    }

    const provider = config?.provider || 'groq';
    let model = config?.model || 'openai/gpt-oss-120b';
    if (!model || model.includes('llama') || model.includes('mixtral')) {
      model = provider === 'groq' ? 'openai/gpt-oss-120b' : 'gpt-4o-mini';
    }
    const maxChars = config?.maxCharacters || 160;

    const leadName = args.leadName || 'Valued Client';
    const advisorName = args.advisorName || 'Advisory Team';
    const campaignTitle = args.originalCampaignTitle || 'Luxury Real Estate';
    const projectInfo = args.project
      ? `Project: ${args.project.name || 'Skyline Luxuria'}, ${args.project.city || 'Downtown'}.`
      : 'BrokerOS Luxury Residences';

    const systemPrompt = `You are ${advisorName}, a senior real estate consultant with BrokerOS Realty.
RULES FOR SMS DRAFTS:
1. BREVITY: The entire output MUST be strictly under ${maxChars} characters (single SMS segment standard).
2. TONE: Polite, natural, professional, direct.
3. CONTEXT-ADAPTIVE:
   - If replying to an ongoing thread, answer the customer's last inquiry directly without fluff.
   - If the thread is empty, write a friendly introductory outreach.
4. NO PLACEHOLDERS: NEVER output [Your Name], **Your Name**, [Phone], [Brokerage], etc. Sign as "${advisorName}" or omit signature.
5. NO UNSOLICITED LINKS: Do NOT insert any random website URLs or links. Focus purely on clear, direct conversation and CTAs.
6. VARIETY: Provide a fresh and distinct phrasing every time.`;

    // Construct conversation flow for LLM
    let userPrompt = '';
    if (args.messages && args.messages.length > 0) {
      const threadHistory = args.messages
        .slice(-8)
        .map((m) => `${m.direction === 'INBOUND' ? `[Client ${leadName}]` : `[Advisor]`}: ${m.text}`)
        .join('\n');

      userPrompt = `Ongoing SMS thread with lead "${leadName}":
${threadHistory}

Project: ${projectInfo}
Campaign: "${campaignTitle}"
${args.customInstructions ? `Instructions: ${args.customInstructions}` : ''}

Draft the next direct SMS reply from advisor to the client (STRICTLY UNDER ${maxChars} CHARACTERS). Answer their latest message directly. No links.`;
    } else if (args.inboundBody) {
      userPrompt = `Inbound SMS from lead "${leadName}":
"${args.inboundBody}"

Project: ${projectInfo}
Campaign: "${campaignTitle}"
${args.customInstructions ? `Instructions: ${args.customInstructions}` : ''}

Generate a concise SMS reply (STRICTLY UNDER ${maxChars} CHARACTERS). No links.`;
    } else {
      userPrompt = `Draft an initial outreach SMS to prospective homebuyer "${leadName}" regarding ${projectInfo}.
Keep it warm, engaging, and STRICTLY UNDER ${maxChars} CHARACTERS with a clear question CTA. No links.`;
    }

    if (apiKey) {
      try {
        const endpoint =
          provider === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 90,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          let replyText = data.choices?.[0]?.message?.content?.trim() || '';
          if (replyText.startsWith('"') && replyText.endsWith('"')) {
            replyText = replyText.slice(1, -1);
          }
          // Remove any accidental markdown or bracketed placeholders
          replyText = replyText.replace(/\[.*?\]/g, '').replace(/\*\*.*?\*\*/g, '').trim();
          if (replyText.length > maxChars) {
            replyText = replyText.slice(0, maxChars - 3) + '...';
          }
          if (replyText) {
            return {
              text: replyText,
              modelUsed: model,
            };
          }
        }
      } catch (err: any) {
        this.logger.error(`AI API call failed: ${err.message}`);
      }
    }

    // Dynamic contextual fallback without links
    const fallbackTemplates = [
      `Hi ${leadName}, thanks for reaching out! Would you like me to share pricing details or schedule a private tour this week?`,
      `Hello ${leadName}, this is ${advisorName} regarding ${projectInfo.slice(0, 30)}. Would you have 2 minutes for a quick chat today?`,
      `Hi ${leadName}, we have exclusive floor plans available. When would be a good time for a quick call?`,
    ];
    const pickedFallback = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];

    return {
      text: pickedFallback.slice(0, maxChars),
      modelUsed: 'context-fallback',
    };
  }

  private getDefaultSystemPrompt(): string {
    return `You are the AI Concierge for BrokerOS, an enterprise real estate brokerage platform.
Your task is to craft high-conversion, polite, and ultra-concise SMS responses to prospective home buyers.
Rules:
1. Always keep responses under 160 characters (GSM-7 single segment standard).
2. Answer inquiries directly (pricing, visit scheduling, brochure requests).
3. Always include a short CTA without unsolicited website links.
4. Never mention you are an AI. Never use bracketed placeholders.`;
  }
}

