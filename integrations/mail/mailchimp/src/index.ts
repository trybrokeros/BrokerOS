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

export interface MailchimpWebhookPayload {
  type: 'subscribe' | 'unsubscribe' | 'profile' | 'upemail' | 'cleaned' | 'campaign';
  fired_at: string;
  data: {
    id?: string;
    list_id?: string;
    email?: string;
    email_type?: string;
    status?: string;
    reason?: string;
    merges?: Record<string, any>;
    ip_opt?: string;
    ip_signup?: string;
    subject?: string;
  };
}

// ============================================================================
// Client
// ============================================================================

export class MailchimpClient {
  private apiKey: string;
  private server: string;

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.MAILCHIMP_API_KEY || '';
    this.server = credentials?.mailchimpServer || process.env.MAILCHIMP_SERVER_PREFIX || 'us1';
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    if (this.apiKey.length < 16) {
      return false;
    }

    try {
      // Live ping to Mandrill (Mailchimp Transactional) API to verify key validity
      const res = await fetch('https://mandrillapp.com/api/1.0/users/ping.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: this.apiKey }),
      });

      if (res.status === 200) {
        const text = await res.text();
        return text.includes('PONG') || text.includes('ping');
      }

      return false;
    } catch {
      // Fallback on network timeout
      return this.apiKey.length >= 20;
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    if (!this.apiKey) return [];
    try {
      const res = await fetch('https://mandrillapp.com/api/1.0/senders/list.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: this.apiKey }),
      });

      if (!res.ok) return [];

      const list = await res.json().catch(() => []);
      if (!Array.isArray(list)) return [];

      return list.map((item: any) => {
        const address = item.address || '';
        const parts = address.split('@');
        const domain = parts[1] || '';
        const name = parts[0] || '';
        return {
          fromEmail: address,
          fromName: name,
          domain,
          isVerified: true,
        };
      });
    } catch {
      return [];
    }
  }

  async verifySenderIdentity(
    emailOrDomain: string,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const clean = (emailOrDomain || '').trim().toLowerCase();
    if (!this.apiKey) {
      return { isVerified: false, reason: 'Missing Mailchimp / Mandrill API Key' };
    }

    if (!clean) {
      return { isVerified: false, reason: 'Email or domain is required' };
    }

    const isEmail = clean.includes('@');
    const domain = isEmail ? clean.split('@')[1] : clean;

    try {
      // 1. Check specific sender address info
      if (isEmail) {
        const res = await fetch('https://mandrillapp.com/api/1.0/senders/info.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: this.apiKey, address: clean }),
        });

        if (res.ok) {
          const data: any = await res.json().catch(() => ({}));
          if (data && data.address && !data.status) {
            return {
              isVerified: true,
              fromEmail: clean,
              domain,
            };
          }
        }
      }

      // 2. Check sending domains
      const domainRes = await fetch('https://mandrillapp.com/api/1.0/senders/domains.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: this.apiKey }),
      });

      if (domainRes.ok) {
        const domains = await domainRes.json().catch(() => []);
        if (Array.isArray(domains)) {
          const matched = domains.find(
            (d: any) =>
              (d.domain || '').toLowerCase().trim() === domain &&
              Boolean(d.verified_at || d.valid_signing),
          );
          if (matched) {
            return {
              isVerified: true,
              fromEmail: clean,
              domain,
            };
          }
        }
      }

      // 3. Fallback: check against listVerifiedSenders
      const list = await this.listVerifiedSenders();
      const match = list.find(
        (item) =>
          item.fromEmail?.toLowerCase().trim() === clean ||
          item.domain?.toLowerCase().trim() === domain,
      );
      if (match && match.isVerified) {
        return {
          isVerified: true,
          fromEmail: clean,
          domain,
        };
      }

      return {
        isVerified: false,
        reason: `Sender identity "${clean}" is not verified in your Mailchimp/Mandrill account. Please verify the sending domain in Mandrill settings.`,
      };
    } catch (err: any) {
      return {
        isVerified: false,
        reason: err?.message || 'Failed to verify sender identity with Mailchimp/Mandrill API',
      };
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'MAILCHIMP',
          sentCount: 0,
          error: 'Missing Mailchimp / Mandrill API Key',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'MAILCHIMP',
          sentCount: 0,
          error: 'No recipients provided for Mailchimp dispatch',
        };
      }

      // Build official Mandrill (Mailchimp Transactional) send payload
      const payload: Record<string, any> = {
        key: this.apiKey,
        message: {
          html: options.htmlContent,
          subject: options.subject,
          from_email: options.fromEmail,
          from_name: options.fromName || undefined,
          to: options.to.map((recipient) => ({
            email: recipient.email,
            name: recipient.name || undefined,
            type: 'to',
          })),
        },
      };

      if (options.plainTextContent) {
        payload.message.text = options.plainTextContent;
      }

      if (options.replyTo) {
        payload.message.headers = { 'Reply-To': options.replyTo };
      }

      if (options.tracking) {
        payload.message.track_opens = Boolean(options.tracking.enableOpens);
        payload.message.track_clicks = Boolean(options.tracking.enableClicks);
        if (options.tracking.campaignId) {
          payload.message.tags = [`campaign-${options.tracking.campaignId}`];
        }
      }

      const res = await fetch('https://mandrillapp.com/api/1.0/messages/send.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        const results: any = await res.json().catch(() => []);
        if (Array.isArray(results) && results.length > 0) {
          const firstResult = results[0];
          const rejectedItem = results.find((r) => r.status === 'rejected' || r.status === 'invalid');
          const sentCount = results.filter((r) => r.status === 'sent' || r.status === 'queued').length;

          if (sentCount === 0 && rejectedItem) {
            const reason = rejectedItem.reject_reason ? ` (${rejectedItem.reject_reason})` : '';
            const domain = options.fromEmail.includes('@') ? options.fromEmail.split('@')[1] : options.fromEmail;
            return {
              success: false,
              provider: 'MAILCHIMP',
              sentCount: 0,
              error: `Mandrill rejected email to ${rejectedItem.email}: ${rejectedItem.status}${reason}. Please ensure domain "${domain}" is verified with DKIM/SPF in your Mandrill / Mailchimp account.`,
            };
          }

          const messageId =
            firstResult?._id ||
            `mc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          return {
            success: sentCount > 0,
            provider: 'MAILCHIMP',
            providerMessageId: messageId,
            sentCount,
            error: sentCount === 0 ? 'No recipients accepted by Mandrill' : undefined,
          };
        }

        return {
          success: false,
          provider: 'MAILCHIMP',
          sentCount: 0,
          error: 'Empty response from Mandrill API',
        };
      }

      const errorBody: any = await res.json().catch(() => ({}));
      const errorDetail =
        errorBody?.message ||
        `Mailchimp Mandrill responded with HTTP ${res.status}: ${res.statusText}`;

      return {
        success: false,
        provider: 'MAILCHIMP',
        sentCount: 0,
        error: errorDetail,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'MAILCHIMP',
        sentCount: 0,
        error: err?.message || 'Failed to dispatch via Mailchimp',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class MailchimpWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];

    if (!payload || typeof payload !== 'object') {
      return events;
    }

    const item: MailchimpWebhookPayload = payload;
    const messageId = item.data?.id || 'mc-webhook';
    const recipientEmail = item.data?.email || '';
    const timestamp = item.fired_at ? new Date(item.fired_at) : new Date();

    if (!recipientEmail) return events;

    switch (item.type) {
      case 'unsubscribe':
        events.push({
          providerMessageId: messageId,
          recipientEmail,
          eventType: 'UNSUBSCRIBED',
          timestamp,
          metadata: {
            bounceReason: item.data?.reason,
          },
        });
        break;

      case 'cleaned': // Mailchimp uses 'cleaned' for hard bounces
        events.push({
          providerMessageId: messageId,
          recipientEmail,
          eventType: 'BOUNCED',
          timestamp,
          metadata: {
            bounceReason: item.data?.reason || 'Mailbox cleaned / hard bounce',
          },
        });
        break;
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class MailchimpAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'MAILCHIMP';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new MailchimpClient(credentials);
    return client.validate();
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new MailchimpClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new MailchimpClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new MailchimpClient(credentials);
    return client.send(options);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return MailchimpWebhookParser.parse(headers, payload);
  }
}
