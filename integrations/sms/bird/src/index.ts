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

export interface BirdDeliveryReport {
  id?: string;
  recipient?: string;
  status?: 'sent' | 'delivered' | 'delivery_failed' | 'buffered' | string;
  statusDatetime?: string;
  statusErrorCode?: number;
  statusReason?: string;
}

export interface BirdInboundMessage {
  id?: string;
  originator?: string;
  recipient?: string;
  body?: string;
  createdDatetime?: string;
}

// ============================================================================
// Client
// ============================================================================

export class BirdSmsClient {
  private apiKey: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.BIRD_API_KEY || '';
    this.fromNumber = credentials?.fromNumber || credentials?.senderId || process.env.BIRD_PHONE_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch('https://rest.messagebird.com/balance', {
        method: 'GET',
        headers: {
          Authorization: `AccessKey ${this.apiKey}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        return typeof data?.amount !== 'undefined';
      }
      return false;
    } catch {
      return this.apiKey.length >= 20;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Bird Configured',
        provider: 'BIRD',
        isVerified: true,
      });
    }

    if (!this.apiKey) return discovered;

    try {
      const res = await fetch('https://rest.messagebird.com/numbers', {
        method: 'GET',
        headers: {
          Authorization: `AccessKey ${this.apiKey}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const items = data?.items || [];
        for (const num of items) {
          const phone = num?.number;
          const formatted = phone ? (phone.startsWith('+') ? phone : `+${phone}`) : '';
          if (formatted && !discovered.some((d) => d.phoneNumber === formatted)) {
            discovered.push({
              phoneNumber: formatted,
              senderId: num?.country ? `Bird (${num.country})` : 'Bird Active',
              provider: 'BIRD',
              isVerified: true,
            });
          }
        }
      }
    } catch {
      // Fallback
    }

    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.apiKey) {
      return { isVerified: false, reason: 'Missing Bird.com API Key' };
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
          provider: 'BIRD',
          sentCount: 0,
          error: 'Missing Bird.com Access Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'BIRD',
          sentCount: 0,
          error: 'No recipients provided for Bird.com SMS dispatch',
        };
      }

      let fromSender = (options.from || this.fromNumber || 'BrokerOS').trim();
      const recipients = options.to.map((r) => r.phone.replace(/\D/g, ''));

      const payload = {
        originator: fromSender,
        recipients,
        body: options.message,
      };

      const res = await fetch('https://rest.messagebird.com/messages', {
        method: 'POST',
        headers: {
          Authorization: `AccessKey ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200 || res.status === 201) {
        const data = (await res.json()) as any;
        const msgId = data?.id;
        const sentCount = data?.recipients?.totalCount || options.to.length;

        return {
          success: true,
          provider: 'BIRD',
          providerMessageId: msgId,
          sentCount,
        };
      }

      const errData = (await res.json().catch(() => ({}))) as any;
      const errorMsg =
        errData?.errors?.[0]?.description ||
        errData?.message ||
        `HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'BIRD',
        sentCount: 0,
        error: errorMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'BIRD',
        sentCount: 0,
        error: err?.message || 'Bird.com dispatch network error',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class BirdSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const data = payload as BirdDeliveryReport;
    const msgId = data.id || (payload as any).messageId;
    const phone = data.recipient || (payload as any).recipient;
    const status = (data.status || '').toLowerCase();

    if (msgId && phone) {
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      let eventType: 'DELIVERED' | 'FAILED' | 'CLICKED' = 'DELIVERED';

      if (status.includes('fail') || status.includes('reject') || status.includes('undeliv')) {
        eventType = 'FAILED';
      }

      events.push({
        providerMessageId: msgId,
        recipientPhone: normalizedPhone,
        eventType,
        timestamp: data.statusDatetime ? new Date(data.statusDatetime) : new Date(),
        metadata: {
          reason: data.statusReason,
          carrierCode: data.statusErrorCode ? String(data.statusErrorCode) : undefined,
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const data = payload as BirdInboundMessage;
    const fromRaw = data.originator || (payload as any).from;
    const toRaw = data.recipient || (payload as any).to;
    const textBody = data.body || (payload as any).text || '';
    const providerMsgId = data.id;

    if (!fromRaw || !textBody) return null;

    const fromPhone = fromRaw.startsWith('+') ? fromRaw : `+${fromRaw}`;
    const toPhone = toRaw ? (toRaw.startsWith('+') ? toRaw : `+${toRaw}`) : '';

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'BIRD',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class BirdSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'BIRD';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new BirdSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new BirdSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new BirdSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new BirdSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return BirdSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return BirdSmsWebhookParser.parseInbound(headers, payload);
  }
}
