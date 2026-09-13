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

export interface TelnyxWebhookPayload {
  data?: {
    event_type?: string;
    id?: string;
    occurred_at?: string;
    payload?: {
      id?: string;
      direction?: string;
      from?: {
        phone_number?: string;
        carrier?: string;
      };
      to?: Array<{
        phone_number?: string;
        status?: string;
        carrier?: string;
      }>;
      text?: string;
      errors?: Array<{
        code?: string;
        title?: string;
        detail?: string;
      }>;
    };
  };
}

// ============================================================================
// Client
// ============================================================================

export class TelnyxSmsClient {
  private apiKey: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.TELNYX_API_KEY || '';
    this.fromNumber = credentials?.fromNumber || credentials?.senderId || process.env.TELNYX_PHONE_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch('https://api.telnyx.com/v2/balance', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return res.status === 200;
    } catch {
      return this.apiKey.startsWith('KEY') && this.apiKey.length >= 25;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Telnyx Configured',
        provider: 'TELNYX',
        isVerified: true,
      });
    }

    if (!this.apiKey) return discovered;

    try {
      const res = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=50', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const numbers = data?.data || [];
        for (const num of numbers) {
          const phone = num?.phone_number;
          if (phone && !discovered.some((d) => d.phoneNumber === phone)) {
            discovered.push({
              phoneNumber: phone,
              senderId: num?.connection_name || 'Telnyx Active',
              provider: 'TELNYX',
              isVerified: num?.status === 'active',
            });
          }
        }
      }
    } catch {
      // Fallback to configured
    }

    return discovered;
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const clean = phoneOrSenderId.trim();
    if (!this.apiKey) {
      return { isVerified: false, reason: 'Missing Telnyx API Key' };
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
          provider: 'TELNYX',
          sentCount: 0,
          error: 'Missing Telnyx API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'TELNYX',
          sentCount: 0,
          error: 'No recipients provided for Telnyx SMS dispatch',
        };
      }

      const fromSender = (options.from || this.fromNumber || 'BrokerOS').trim();
      const failedRecipients: Array<{ phone: string; reason: string }> = [];
      let successCount = 0;
      let lastMsgId: string | undefined;

      for (const rec of options.to) {
        const payload = {
          from: fromSender,
          to: rec.phone,
          text: options.message,
          use_profile_webhooks: true,
        };

        const res = await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 200 || res.status === 201) {
          const data = (await res.json()) as any;
          successCount++;
          lastMsgId = data?.data?.id;
        } else {
          const errBody = (await res.json().catch(() => ({}))) as any;
          const errMsg = errBody?.errors?.[0]?.detail || `HTTP ${res.status}: ${res.statusText}`;
          failedRecipients.push({
            phone: rec.phone,
            reason: errMsg,
          });
        }
      }

      return {
        success: successCount > 0,
        provider: 'TELNYX',
        providerMessageId: lastMsgId,
        sentCount: successCount,
        failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
        error: successCount === 0 && failedRecipients.length > 0 ? failedRecipients[0].reason : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'TELNYX',
        sentCount: 0,
        error: err?.message || 'Telnyx network dispatch error',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class TelnyxSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const data = (payload as TelnyxWebhookPayload).data;
    if (!data) return events;

    const eventTypeRaw = (data.event_type || '').toLowerCase();
    const payloadData = data.payload;
    const msgId = payloadData?.id || data.id;
    const toItem = payloadData?.to?.[0];
    const phone = toItem?.phone_number;

    if (msgId && phone) {
      let eventType: 'DELIVERED' | 'FAILED' | 'CLICKED' = 'DELIVERED';
      if (
        eventTypeRaw.includes('failed') ||
        eventTypeRaw.includes('undelivered') ||
        toItem?.status === 'failed' ||
        toItem?.status === 'undelivered'
      ) {
        eventType = 'FAILED';
      }

      events.push({
        providerMessageId: msgId,
        recipientPhone: phone,
        eventType,
        timestamp: data.occurred_at ? new Date(data.occurred_at) : new Date(),
        metadata: {
          reason: payloadData?.errors?.[0]?.detail,
          carrierCode: toItem?.carrier,
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const data = (payload as TelnyxWebhookPayload).data;
    if (!data) return null;

    const eventType = (data.event_type || '').toLowerCase();
    if (eventType !== 'message.received') return null;

    const payloadData = data.payload;
    const fromPhone = payloadData?.from?.phone_number;
    const toPhone = payloadData?.to?.[0]?.phone_number || '';
    const textBody = payloadData?.text || '';
    const providerMsgId = payloadData?.id || data.id;

    if (!fromPhone || !textBody) return null;

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'TELNYX',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class TelnyxSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'TELNYX';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new TelnyxSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new TelnyxSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new TelnyxSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new TelnyxSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return TelnyxSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return TelnyxSmsWebhookParser.parseInbound(headers, payload);
  }
}
