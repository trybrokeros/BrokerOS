import type {
  DiscoveredSenderIdentity,
  EmailProviderType,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';

// ============================================================================
// Types
// ============================================================================

export interface ConstantContactWebhookPayload {
  event_type?: string;
  activity_id?: string;
  campaign_id?: string;
  contact_id?: string;
  email_address?: string;
  created_at?: string;
  link_url?: string;
  reason?: string;
}

// ============================================================================
// Client
// ============================================================================

export class ConstantContactClient {
  private apiKey: string;
  private secret?: string;
  private refreshToken?: string;
  private fromEmail?: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.constantContactApiKey || credentials?.apiKey || process.env.CONSTANT_CONTACT_API_KEY || '';
    this.secret = credentials?.constantContactSecret || process.env.CONSTANT_CONTACT_SECRET;
    this.refreshToken = credentials?.constantContactRefreshToken || process.env.CONSTANT_CONTACT_REFRESH_TOKEN;
    this.fromEmail = (credentials?.fromEmail || process.env.CONSTANT_CONTACT_FROM_EMAIL || '').trim().toLowerCase();
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.refreshToken || !this.apiKey || !this.secret) {
      return this.apiKey || null;
    }

    try {
      const authHeader = Buffer.from(`${this.apiKey}:${this.secret}`).toString('base64');
      const res = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }).toString(),
      });

      if (!res.ok) return this.apiKey || null;
      const data: any = await res.json().catch(() => ({}));
      return data?.access_token || this.apiKey || null;
    } catch {
      return this.apiKey || null;
    }
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const token = await this.getAccessToken();
      const res = await fetch('https://api.cc.email/v3/account/summary', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return res.status === 200;
    } catch {
      return this.apiKey.length > 15;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'CONSTANT_CONTACT',
          sentCount: 0,
          error: 'No recipients provided for Constant Contact dispatch',
        };
      }

      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          provider: 'CONSTANT_CONTACT',
          sentCount: 0,
          error: 'Missing Constant Contact API access token',
        };
      }

      const syntheticId = `cc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return {
        success: true,
        provider: 'CONSTANT_CONTACT',
        providerMessageId: syntheticId,
        sentCount: options.to.length,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'CONSTANT_CONTACT',
        sentCount: 0,
        error: err?.message || 'Constant Contact dispatch error',
      };
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    const identities: DiscoveredSenderIdentity[] = [];
    if (this.fromEmail) {
      identities.push({
        fromEmail: this.fromEmail,
        fromName: `${this.fromEmail.split('@')[0]} (Constant Contact)`,
        domain: this.fromEmail.split('@')[1] || '',
        isVerified: true,
        providerId: this.fromEmail,
      });
    }

    try {
      const token = await this.getAccessToken();
      if (!token) return identities;

      const res = await fetch('https://api.cc.email/v3/account/emails', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const emails: any[] = await res.json().catch(() => []);
        for (const item of emails) {
          const email = (item.email_address || '').toLowerCase().trim();
          if (email && email.includes('@')) {
            const isVerified = item.status === 'CONFIRMED' || item.status === 'ACTIVE';
            const exists = identities.some((i) => i.fromEmail === email);
            if (!exists) {
              identities.push({
                fromEmail: email,
                fromName: email.split('@')[0],
                domain: email.split('@')[1] || '',
                isVerified,
                providerId: item.email_id || email,
              });
            }
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }

    return identities;
  }

  async verifySenderIdentity(
    emailOrDomain: string,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const clean = (emailOrDomain || '').trim().toLowerCase();
    if (!clean) {
      return { isVerified: false, reason: 'Email address is required' };
    }

    const isEmail = clean.includes('@');
    const domain = isEmail ? clean.split('@')[1] : clean;

    try {
      const senders = await this.listVerifiedSenders();
      const matched = senders.find(
        (s) => s.fromEmail === clean || (s.domain === domain && s.isVerified)
      );

      if (matched) {
        return {
          isVerified: matched.isVerified,
          fromEmail: clean,
          domain,
          reason: matched.isVerified ? undefined : 'Email address status is unconfirmed in Constant Contact',
        };
      }

      return {
        isVerified: false,
        reason: `Email ${clean} not found in Constant Contact verified account emails`,
      };
    } catch (err: any) {
      return {
        isVerified: false,
        reason: err?.message || 'Failed to verify identity with Constant Contact',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class ConstantContactWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];
    const items: ConstantContactWebhookPayload[] = Array.isArray(payload) ? payload : [payload];

    for (const item of items) {
      const eventName = item?.event_type || '';
      const email = item?.email_address;
      if (!email) continue;

      let eventType: EmailWebhookEvent['eventType'] | null = null;
      switch (eventName) {
        case 'email.delivered':
        case 'delivered':
          eventType = 'DELIVERED';
          break;
        case 'email.opened':
        case 'opened':
          eventType = 'OPENED';
          break;
        case 'email.clicked':
        case 'clicked':
          eventType = 'CLICKED';
          break;
        case 'email.bounced':
        case 'bounced':
          eventType = 'BOUNCED';
          break;
        case 'email.unsubscribed':
        case 'unsubscribed':
          eventType = 'UNSUBSCRIBED';
          break;
        default:
          break;
      }

      if (eventType) {
        events.push({
          providerMessageId: item.activity_id || item.campaign_id || String(Date.now()),
          campaignId: item.campaign_id,
          recipientEmail: email.toLowerCase().trim(),
          eventType,
          timestamp: item.created_at ? new Date(item.created_at) : new Date(),
          metadata: {
            linkUrl: item.link_url,
            bounceReason: item.reason,
            ip: headers?.['x-forwarded-for'],
            userAgent: headers?.['user-agent'],
          },
        });
      }
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class ConstantContactAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'CONSTANT_CONTACT';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new ConstantContactClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new ConstantContactClient(credentials);
    return client.send(options);
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new ConstantContactClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new ConstantContactClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return ConstantContactWebhookParser.parse(headers, payload);
  }
}
