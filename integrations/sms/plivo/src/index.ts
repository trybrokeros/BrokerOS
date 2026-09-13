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

export interface PlivoStatusCallback {
  MessageUUID?: string;
  ParentMessageUUID?: string;
  To?: string;
  From?: string;
  Status?: 'queued' | 'sent' | 'delivered' | 'undelivered' | 'failed' | string;
  Units?: string;
  ErrorCode?: string;
  TotalRate?: string;
  TotalAmount?: string;
}

export interface PlivoInboundMessage {
  From?: string;
  To?: string;
  Text?: string;
  MessageUUID?: string;
}

// ============================================================================
// Client
// ============================================================================

export class PlivoSmsClient {
  private authId: string;
  private authToken: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.authId = credentials?.authId || process.env.PLIVO_AUTH_ID || '';
    this.authToken = credentials?.authToken || process.env.PLIVO_AUTH_TOKEN || '';
    this.fromNumber = credentials?.fromNumber || credentials?.senderId || process.env.PLIVO_PHONE_NUMBER;
  }

  private getAuthHeader(): string {
    const raw = `${this.authId}:${this.authToken}`;
    return `Basic ${Buffer.from(raw).toString('base64')}`;
  }

  async validate(): Promise<boolean> {
    if (!this.authId || !this.authToken) return false;

    try {
      const res = await fetch(`https://api.plivo.com/v1/Account/${encodeURIComponent(this.authId)}/`, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        return data?.state === 'active' || !!data?.name;
      }
      return false;
    } catch {
      return this.authId.startsWith('MA') && this.authToken.length >= 20;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Plivo Configured',
        provider: 'PLIVO',
        isVerified: true,
      });
    }

    if (!this.authId || !this.authToken) return discovered;

    try {
      const res = await fetch(
        `https://api.plivo.com/v1/Account/${encodeURIComponent(this.authId)}/Number/?limit=50`,
        {
          method: 'GET',
          headers: {
            Authorization: this.getAuthHeader(),
          },
        },
      );

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const objects = data?.objects || [];
        for (const num of objects) {
          const phone = num?.number;
          const formatted = phone ? (phone.startsWith('+') ? phone : `+${phone}`) : '';
          if (formatted && !discovered.some((d) => d.phoneNumber === formatted)) {
            discovered.push({
              phoneNumber: formatted,
              senderId: num?.alias || 'Plivo Active',
              provider: 'PLIVO',
              isVerified: true,
            });
          }
        }
      }
    } catch {
      // Return configured
    }

    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.authId || !this.authToken) {
      return { isVerified: false, reason: 'Missing Plivo credentials' };
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
      if (!this.authId || !this.authToken) {
        return {
          success: false,
          provider: 'PLIVO',
          sentCount: 0,
          error: 'Missing Plivo Auth ID or Token',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'PLIVO',
          sentCount: 0,
          error: 'No recipients provided for Plivo SMS dispatch',
        };
      }

      let fromSender = (options.from || this.fromNumber || 'BrokerOS').trim();
      // Plivo requires E.164 without leading '+' or standard alphanumeric
      const cleanFrom = fromSender.startsWith('+') ? fromSender.substring(1) : fromSender;

      const failedRecipients: Array<{ phone: string; reason: string }> = [];
      let successCount = 0;
      let lastMsgId: string | undefined;

      // Plivo accepts dst delimiter "<" for batching up to 1000 numbers in one call!
      const dstList = options.to.map((r) => r.phone.replace(/\D/g, '')).join('<');

      const payload = {
        src: cleanFrom,
        dst: dstList,
        text: options.message,
      };

      const res = await fetch(`https://api.plivo.com/v1/Account/${encodeURIComponent(this.authId)}/Message/`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200 || res.status === 202) {
        const data = (await res.json()) as any;
        const messageUuids = data?.message_uuid || [];
        lastMsgId = Array.isArray(messageUuids) ? messageUuids[0] : messageUuids;
        successCount = options.to.length;

        return {
          success: true,
          provider: 'PLIVO',
          providerMessageId: lastMsgId,
          sentCount: successCount,
        };
      }

      const errData = (await res.json().catch(() => ({}))) as any;
      const errMsg = errData?.error || errData?.message || `HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'PLIVO',
        sentCount: 0,
        error: errMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'PLIVO',
        sentCount: 0,
        error: err?.message || 'Plivo dispatch network error',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class PlivoSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const data = payload as PlivoStatusCallback;
    const msgId = data.MessageUUID || data.ParentMessageUUID;
    const phone = data.To;
    const status = (data.Status || '').toLowerCase();

    if (msgId && phone) {
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      let eventType: 'DELIVERED' | 'FAILED' | 'CLICKED' = 'DELIVERED';

      if (status === 'failed' || status === 'undelivered' || data.ErrorCode) {
        eventType = 'FAILED';
      }

      events.push({
        providerMessageId: msgId,
        recipientPhone: normalizedPhone,
        eventType,
        timestamp: new Date(),
        metadata: {
          reason: data.ErrorCode ? `Plivo Error Code ${data.ErrorCode}` : undefined,
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const data = payload as PlivoInboundMessage;
    const fromRaw = data.From;
    const toRaw = data.To;
    const textBody = data.Text || '';
    const providerMsgId = data.MessageUUID;

    if (!fromRaw || !textBody) return null;

    const fromPhone = fromRaw.startsWith('+') ? fromRaw : `+${fromRaw}`;
    const toPhone = toRaw ? (toRaw.startsWith('+') ? toRaw : `+${toRaw}`) : '';

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'PLIVO',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class PlivoSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'PLIVO';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new PlivoSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new PlivoSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new PlivoSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new PlivoSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return PlivoSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return PlivoSmsWebhookParser.parseInbound(headers, payload);
  }
}
