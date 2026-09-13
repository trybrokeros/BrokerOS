import type {
  DiscoveredSenderNumber,
  InboundSmsPayload,
  ISmsMarketingProvider,
  SendSmsOptions,
  SendSmsResult,
  SmsProviderCredentials,
  SmsProviderType,
  SmsWebhookEvent,
} from '@brokeros/types';

// ============================================================================
// Types
// ============================================================================

export interface InfobipDeliveryReport {
  results?: Array<{
    messageId: string;
    to: string;
    sentAt?: string;
    doneAt?: string;
    status?: {
      groupId?: number;
      groupName?: string;
      id?: number;
      name?: string;
      description?: string;
    };
    error?: {
      groupId?: number;
      groupName?: string;
      id?: number;
      name?: string;
      description?: string;
      permanent?: boolean;
    };
  }>;
}

export interface InfobipInboundMessage {
  results?: Array<{
    messageId: string;
    from: string;
    to: string;
    text: string;
    cleanText?: string;
    receivedAt?: string;
  }>;
}

// ============================================================================
// Client
// ============================================================================

export class InfobipSmsClient {
  private apiKey: string;
  private baseUrl: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.INFOBIP_API_KEY || '';
    let url = credentials?.baseUrl || process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    url = url.trim().replace(/\/+$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    this.baseUrl = url;
    this.fromNumber = credentials?.fromNumber || credentials?.senderId || process.env.INFOBIP_SENDER_ID;
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch(`${this.baseUrl}/settings/1/accounts`, {
        method: 'GET',
        headers: {
          Authorization: `App ${this.apiKey}`,
        },
      });

      return res.status === 200;
    } catch {
      return this.apiKey.length >= 20;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Infobip Configured',
        provider: 'INFOBIP',
        isVerified: true,
      });
    }

    if (!this.apiKey) return discovered;

    try {
      const res = await fetch(`${this.baseUrl}/numbers/1/numbers`, {
        method: 'GET',
        headers: {
          Authorization: `App ${this.apiKey}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const numbers = data?.numbers || [];
        for (const num of numbers) {
          const phone = num?.numberKey;
          if (phone && !discovered.some((d) => d.phoneNumber === phone)) {
            discovered.push({
              phoneNumber: phone,
              senderId: num?.keyword || 'Infobip Virtual',
              provider: 'INFOBIP',
              isVerified: true,
            });
          }
        }
      }
    } catch {
      // Return fallback
    }

    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.apiKey) {
      return { isVerified: false, reason: 'Missing Infobip API key' };
    }

    // Alphanumeric Sender ID (e.g. SKYLIN) - max 11 characters
    if (!clean.startsWith('+') && !/^\d+$/.test(clean)) {
      if (clean.length > 11) {
        return { isVerified: false, reason: 'Alphanumeric sender ID cannot exceed 11 characters' };
      }
      return { isVerified: true, formattedNumber: clean };
    }

    const normalizedPhone = clean.startsWith('+') ? clean : `+${clean}`;
    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      return { isVerified: false, reason: 'Invalid E.164 phone number format' };
    }

    return { isVerified: true, formattedNumber: normalizedPhone };
  }

  async send(options: SendSmsOptions): Promise<SendSmsResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'INFOBIP',
          sentCount: 0,
          error: 'Missing Infobip API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'INFOBIP',
          sentCount: 0,
          error: 'No recipients provided for Infobip SMS dispatch',
        };
      }

      const fromSender = (options.from || this.fromNumber || 'BrokerOS').trim();

      const payload = {
        messages: [
          {
            destinations: options.to.map((r) => ({ to: r.phone })),
            from: fromSender,
            text: options.message,
            ...(options.dltEntityId ? { entityId: options.dltEntityId } : {}),
            ...(options.dltTemplateId ? { dltTemplateId: options.dltTemplateId } : {}),
          },
        ],
      };

      const res = await fetch(`${this.baseUrl}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
          Authorization: `App ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200 || res.status === 201) {
        const data = (await res.json()) as any;
        const messages = data?.messages || [];
        const firstId = messages[0]?.messageId;
        const failedRecipients: Array<{ phone: string; reason: string }> = [];

        for (const msg of messages) {
          const statusGroup = msg?.status?.groupName;
          if (statusGroup === 'FAILED' || statusGroup === 'REJECTED') {
            failedRecipients.push({
              phone: msg?.to,
              reason: msg?.status?.description || 'Infobip delivery rejected',
            });
          }
        }

        const successCount = options.to.length - failedRecipients.length;

        return {
          success: successCount > 0,
          provider: 'INFOBIP',
          providerMessageId: firstId,
          sentCount: successCount,
          failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
          error: successCount === 0 && failedRecipients.length > 0 ? failedRecipients[0].reason : undefined,
        };
      }

      const errBody = (await res.json().catch(() => ({}))) as any;
      const errorMsg =
        errBody?.requestError?.serviceException?.text ||
        errBody?.description ||
        `HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'INFOBIP',
        sentCount: 0,
        error: errorMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'INFOBIP',
        sentCount: 0,
        error: err?.message || 'Infobip dispatch network error',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class InfobipSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const results = payload.results || (Array.isArray(payload) ? payload : [payload]);

    for (const item of results) {
      const msgId = item.messageId;
      const phone = item.to;
      const group = (item.status?.groupName || item.status?.name || '').toUpperCase();

      if (msgId && phone) {
        let eventType: 'DELIVERED' | 'FAILED' | 'CLICKED' = 'DELIVERED';
        if (group.includes('FAIL') || group.includes('REJECT') || group.includes('UNDELIV')) {
          eventType = 'FAILED';
        }

        events.push({
          providerMessageId: msgId,
          recipientPhone: phone,
          eventType,
          timestamp: item.doneAt ? new Date(item.doneAt) : new Date(),
          metadata: {
            reason: item.error?.description || item.status?.description,
            carrierCode: item.status?.id ? String(item.status.id) : undefined,
          },
        });
      }
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const results = payload.results || (Array.isArray(payload) ? payload : [payload]);
    if (results.length === 0) return null;

    const first = results[0];
    const fromPhone = first.from || '';
    const toPhone = first.to || '';
    const textBody = first.cleanText || first.text || '';
    const providerMsgId = first.messageId;

    if (!fromPhone || !textBody) return null;

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'INFOBIP',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class InfobipSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'INFOBIP';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new InfobipSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new InfobipSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new InfobipSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new InfobipSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return InfobipSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return InfobipSmsWebhookParser.parseInbound(headers, payload);
  }
}
