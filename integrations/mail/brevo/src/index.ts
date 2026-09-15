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

export interface BrevoWebhookEventPayload {
  event:
  | 'request'
  | 'delivered'
  | 'hard_bounce'
  | 'soft_bounce'
  | 'blocked'
  | 'spam'
  | 'invalid_email'
  | 'deferred'
  | 'click'
  | 'opened'
  | 'unique_opened'
  | 'unsubscribed'
  | 'list_addition';
  email: string;
  id?: number;
  date: string;
  'message-id'?: string;
  ts?: number;
  'event-id'?: string;
  link?: string;
  ip?: string;
  user_agent?: string;
  reason?: string;
  tag?: string;
  campaign_name?: string;
}

// ============================================================================
// Client
// ============================================================================

export class BrevoClient {
  private apiKey: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.BREVO_API_KEY || '';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    // Brevo API v3 keys start with "xkeysib-" and are at least 40 chars long.
    // If the key is clearly not a Brevo key format AND is very short, reject immediately.
    const isBrevoFormat = this.apiKey.startsWith('xkeysib-');
    if (!isBrevoFormat && this.apiKey.length < 20) {
      return false;
    }

    try {
      // Best-effort live ping to Brevo API v3 to verify the API key
      const res = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
        // 8-second timeout so dev server doesn't hang
        signal: AbortSignal.timeout(8000),
      });

      // 200 = valid key with account data
      // 403 = valid key but insufficient permission (still a real authenticated key)
      if (res.status === 200 || res.status === 403) {
        return true;
      }

      // 401 = definitely wrong/revoked API key
      if (res.status === 401) {
        return false;
      }

      // Any other status (429 rate-limit, 5xx server error, etc.):
      // Trust the key format — Brevo's API might be temporarily unreachable
      return isBrevoFormat || this.apiKey.length >= 40;
    } catch {
      // Network timeout, DNS failure, or firewall block:
      // Fall back to format-based trust — a properly-formatted key should be accepted
      return isBrevoFormat || this.apiKey.length >= 40;
    }
  }


  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'BREVO',
          sentCount: 0,
          error: 'Missing Brevo API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'BREVO',
          sentCount: 0,
          error: 'No recipients provided for Brevo dispatch',
        };
      }

      // Build official Brevo (Sendinblue) Transactional API payload
      const payload: Record<string, any> = {
        sender: {
          name: options.fromName,
          email: options.fromEmail,
        },
        to: options.to.map((recipient) => ({
          email: recipient.email,
          name: recipient.name || undefined,
        })),
        subject: options.subject,
        htmlContent: options.htmlContent,
      };

      if (options.plainTextContent) {
        payload.textContent = options.plainTextContent;
      }

      if (options.replyTo) {
        payload.replyTo = { email: options.replyTo };
      }

      if (options.tracking?.campaignId) {
        payload.tags = [`campaign-${options.tracking.campaignId}`];
      }

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201 || res.status === 200) {
        const body: any = await res.json().catch(() => ({}));
        const messageId =
          body?.messageId ||
          body?.messageIds?.[0] ||
          `brevo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        return {
          success: true,
          provider: 'BREVO',
          providerMessageId: messageId,
          sentCount: options.to.length,
        };
      }

      const errorBody: any = await res.json().catch(() => ({}));
      const errorDetail =
        errorBody?.message ||
        `Brevo responded with HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'BREVO',
        sentCount: 0,
        error: errorDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'BREVO',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch via Brevo',
      };
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    if (!this.apiKey) return [];
    try {
      const res = await fetch('https://api.brevo.com/v3/senders', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (res.status === 200) {
        const data: any = await res.json().catch(() => ({}));
        const senders = data?.senders || (Array.isArray(data) ? data : []);
        if (Array.isArray(senders)) {
          return senders
            .map((s: any) => {
              const fromEmail = s.email || '';
              const domain = fromEmail.includes('@') ? fromEmail.split('@')[1] : '';
              return {
                fromEmail,
                fromName: s.name || fromEmail.split('@')[0] || 'Sales Team',
                domain,
                isVerified: Boolean(s.active !== false),
                providerId: String(s.id || ''),
              };
            })
            .filter((s: DiscoveredSenderIdentity) => s.fromEmail && s.fromEmail.includes('@'));
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  async verifySenderIdentity(
    emailOrDomain: string,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const clean = (emailOrDomain || '').trim().toLowerCase();
    if (!this.apiKey) {
      return { isVerified: false, reason: 'Missing Brevo API Key' };
    }

    if (!clean) {
      return { isVerified: false, reason: 'Email or domain is required' };
    }

    const isEmail = clean.includes('@');
    const domain = isEmail ? clean.split('@')[1] : clean;

    try {
      // 1. Check senders list
      const res = await fetch('https://api.brevo.com/v3/senders', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (res.status === 200) {
        const data: any = await res.json().catch(() => ({}));
        const senders = data?.senders || (Array.isArray(data) ? data : []);
        if (Array.isArray(senders)) {
          const match = senders.find((s: any) => {
            const senderEmail = (s.email || '').toLowerCase().trim();
            return senderEmail === clean && Boolean(s.active !== false);
          });
          if (match) {
            return {
              isVerified: true,
              fromEmail: clean,
              domain: domain,
            };
          }
        }
      }

      // 2. Check authenticated domains
      const domainRes = await fetch('https://api.brevo.com/v3/senders/domains', {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
      });

      if (domainRes.status === 200) {
        const domainData: any = await domainRes.json().catch(() => ({}));
        const domains = domainData?.domains || (Array.isArray(domainData) ? domainData : []);
        if (Array.isArray(domains)) {
          const matchedDomain = domains.find(
            (d: any) =>
              (d.domain_name || d.name || '').toLowerCase().trim() === domain &&
              Boolean(d.authenticated !== false),
          );
          if (matchedDomain) {
            return {
              isVerified: true,
              fromEmail: clean,
              domain: domain,
            };
          }
        }
      }

      return {
        isVerified: false,
        reason: `Sender email or domain "${clean}" is not verified or active in your Brevo account. Please add and verify it in Brevo Senders & IPs dashboard.`,
      };
    } catch (err: any) {
      return {
        isVerified: false,
        reason: err?.message || 'Failed to verify sender identity with Brevo API',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class BrevoWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    if (!payload || typeof payload !== 'object') {
      return events;
    }

    const item: BrevoWebhookEventPayload = payload;
    const messageId = item['message-id'] || String(item.id || 'unknown');
    const timestamp = item.date ? new Date(item.date) : new Date();

    switch (item.event) {
      case 'delivered':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'DELIVERED',
          timestamp,
        });
        break;

      case 'opened':
      case 'unique_opened':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'OPENED',
          timestamp,
          metadata: {
            ip: item.ip,
            userAgent: item.user_agent,
          },
        });
        break;

      case 'click':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'CLICKED',
          timestamp,
          metadata: {
            linkUrl: item.link,
            ip: item.ip,
            userAgent: item.user_agent,
          },
        });
        break;

      case 'hard_bounce':
      case 'soft_bounce':
      case 'blocked':
      case 'invalid_email':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'BOUNCED',
          timestamp,
          metadata: {
            bounceReason: item.reason || 'Bounced',
          },
        });
        break;

      case 'spam':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'SPAM_COMPLAINT',
          timestamp,
        });
        break;

      case 'unsubscribed':
        events.push({
          providerMessageId: messageId,
          campaignId: item.tag,
          recipientEmail: item.email,
          eventType: 'UNSUBSCRIBED',
          timestamp,
        });
        break;
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class BrevoAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'BREVO';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new BrevoClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new BrevoClient(credentials);
    return client.send(options);
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new BrevoClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new BrevoClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return BrevoWebhookParser.parse(headers, payload);
  }
}
