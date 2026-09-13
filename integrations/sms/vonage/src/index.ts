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

export interface VonageDeliveryReceipt {
  messageId?: string;
  msisdn?: string;
  to?: string;
  status?: string;
  'err-code'?: string;
  'message-timestamp'?: string;
  price?: string;
}

export interface VonageInboundMessage {
  msisdn?: string;
  to?: string;
  messageId?: string;
  text?: string;
  'message-timestamp'?: string;
}

// ============================================================================
// Client
// ============================================================================

export class VonageSmsClient {
  private apiKey: string;
  private apiSecret: string;
  private fromNumber?: string;

  constructor(credentials?: SmsProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.VONAGE_API_KEY || '';
    this.apiSecret = credentials?.apiSecret || process.env.VONAGE_API_SECRET || '';
    this.fromNumber = credentials?.fromNumber || credentials?.senderId || process.env.VONAGE_PHONE_NUMBER;
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) return false;

    try {
      const res = await fetch(
        `https://rest.nexmo.com/account/get-balance?api_key=${encodeURIComponent(this.apiKey)}&api_secret=${encodeURIComponent(this.apiSecret)}`,
        { method: 'GET' },
      );

      if (res.status === 200) {
        const data = (await res.json()) as any;
        return typeof data.value === 'number';
      }
      return false;
    } catch {
      return this.apiKey.length >= 6 && this.apiSecret.length >= 8;
    }
  }

  async listSenderNumbers(): Promise<DiscoveredSenderNumber[]> {
    const discovered: DiscoveredSenderNumber[] = [];
    if (this.fromNumber) {
      discovered.push({
        phoneNumber: this.fromNumber,
        senderId: 'Vonage Configured',
        provider: 'VONAGE',
        isVerified: true,
      });
    }

    if (!this.apiKey || !this.apiSecret) return discovered;

    try {
      const res = await fetch(
        `https://rest.nexmo.com/account/numbers?api_key=${encodeURIComponent(this.apiKey)}&api_secret=${encodeURIComponent(this.apiSecret)}`,
        { method: 'GET' },
      );

      if (res.status === 200) {
        const data = (await res.json()) as any;
        const numbers = data?.numbers || [];
        for (const num of numbers) {
          const msisdn = num?.msisdn;
          const phone = msisdn ? (msisdn.startsWith('+') ? msisdn : `+${msisdn}`) : '';
          if (phone && !discovered.some((d) => d.phoneNumber === phone)) {
            discovered.push({
              phoneNumber: phone,
              senderId: num?.country ? `Vonage (${num.country})` : 'Vonage Virtual',
              provider: 'VONAGE',
              isVerified: true,
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
    if (!this.apiKey || !this.apiSecret) {
      return { isVerified: false, reason: 'Missing Vonage credentials' };
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
      if (!this.apiKey || !this.apiSecret) {
        return {
          success: false,
          provider: 'VONAGE',
          sentCount: 0,
          error: 'Missing Vonage API Key or Secret',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'VONAGE',
          sentCount: 0,
          error: 'No recipients provided for Vonage SMS dispatch',
        };
      }

      let fromSender = (options.from || this.fromNumber || 'BrokerOS').trim();
      if (fromSender.startsWith('+')) {
        fromSender = fromSender.substring(1); // Vonage accepts plain digits or alphanumeric
      }

      const failedRecipients: Array<{ phone: string; reason: string }> = [];
      let successCount = 0;
      let lastMsgId: string | undefined;

      for (const rec of options.to) {
        const destPhone = rec.phone.replace(/\D/g, '');

        const payload = {
          api_key: this.apiKey,
          api_secret: this.apiSecret,
          to: destPhone,
          from: fromSender,
          text: options.message,
        };

        const res = await fetch('https://rest.nexmo.com/sms/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 200) {
          const data = (await res.json()) as any;
          const msg = data?.messages?.[0];
          if (msg?.status === '0') {
            successCount++;
            lastMsgId = msg['message-id'];
          } else {
            failedRecipients.push({
              phone: rec.phone,
              reason: msg?.['error-text'] || `Vonage status error: ${msg?.status}`,
            });
          }
        } else {
          failedRecipients.push({
            phone: rec.phone,
            reason: `HTTP ${res.status}: ${res.statusText}`,
          });
        }
      }

      return {
        success: successCount > 0,
        provider: 'VONAGE',
        providerMessageId: lastMsgId,
        sentCount: successCount,
        failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined,
        error: successCount === 0 && failedRecipients.length > 0 ? failedRecipients[0].reason : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'VONAGE',
        sentCount: 0,
        error: err?.message || 'Vonage dispatch network error',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class VonageSmsWebhookParser {
  static parse(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    const events: SmsWebhookEvent[] = [];
    if (!payload || typeof payload !== 'object') return events;

    const data = payload as VonageDeliveryReceipt;
    const msgId = data.messageId || (payload as any)['message-id'];
    const phone = data.msisdn || data.to;
    const status = (data.status || '').toLowerCase();

    if (msgId && phone) {
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      let eventType: 'DELIVERED' | 'FAILED' | 'CLICKED' = 'DELIVERED';

      if (status === 'failed' || status === 'rejected' || status === 'expired' || (data['err-code'] && data['err-code'] !== '0')) {
        eventType = 'FAILED';
      }

      events.push({
        providerMessageId: msgId,
        recipientPhone: normalizedPhone,
        eventType,
        timestamp: data['message-timestamp'] ? new Date(data['message-timestamp']) : new Date(),
        metadata: {
          reason: data['err-code'] ? `Vonage Error Code ${data['err-code']}` : undefined,
        },
      });
    }

    return events;
  }

  static parseInbound(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    if (!payload || typeof payload !== 'object') return null;

    const data = payload as VonageInboundMessage;
    const fromRaw = data.msisdn || (payload as any).from;
    const toRaw = data.to;
    const textBody = data.text || (payload as any).body || '';
    const providerMsgId = data.messageId || (payload as any)['message-id'];

    if (!fromRaw || !textBody) return null;

    const fromPhone = fromRaw.startsWith('+') ? fromRaw : `+${fromRaw}`;
    const toPhone = toRaw ? (toRaw.startsWith('+') ? toRaw : `+${toRaw}`) : '';

    return {
      fromPhone,
      toPhone,
      textBody,
      provider: 'VONAGE',
      providerMsgId,
      headers,
    };
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class VonageSmsAdapter implements ISmsMarketingProvider {
  readonly providerType: SmsProviderType = 'VONAGE';

  async validateCredentials(credentials: SmsProviderCredentials): Promise<boolean> {
    const client = new VonageSmsClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendSmsOptions, credentials?: SmsProviderCredentials): Promise<SendSmsResult> {
    const client = new VonageSmsClient(credentials);
    return client.send(options);
  }

  async listSenderNumbers(credentials?: SmsProviderCredentials): Promise<DiscoveredSenderNumber[]> {
    const client = new VonageSmsClient(credentials);
    return client.listSenderNumbers();
  }

  async verifySenderNumber(
    phoneOrSenderId: string,
    credentials?: SmsProviderCredentials,
  ): Promise<{ isVerified: boolean; formattedNumber?: string; reason?: string }> {
    const client = new VonageSmsClient(credentials);
    return client.verifySenderNumber(phoneOrSenderId);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): SmsWebhookEvent[] {
    return VonageSmsWebhookParser.parse(headers, payload);
  }

  parseInboundMessage(headers: Record<string, any>, payload: any): InboundSmsPayload | null {
    return VonageSmsWebhookParser.parseInbound(headers, payload);
  }
}
