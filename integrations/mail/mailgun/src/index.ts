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

export interface MailgunWebhookEventPayload {
  signature?: {
    timestamp: string;
    token: string;
    signature: string;
  };
  'event-data'?: {
    id: string;
    timestamp: number;
    event:
      | 'accepted'
      | 'delivered'
      | 'opened'
      | 'clicked'
      | 'failed'
      | 'unsubscribed'
      | 'complained';
    recipient: string;
    message?: {
      headers?: {
        'message-id'?: string;
      };
    };
    'user-variables'?: {
      campaignId?: string;
    };
    severity?: 'temporary' | 'permanent';
    reason?: string;
    'delivery-status'?: {
      message?: string;
      code?: number;
      description?: string;
    };
    url?: string;
    ip?: string;
    'client-info'?: {
      'user-agent'?: string;
      'client-name'?: string;
      'client-type'?: string;
    };
  };
}

// ============================================================================
// Client
// ============================================================================

export class MailgunClient {
  private apiKey: string;
  private domain: string;
  private region: 'US' | 'EU';

  constructor(credentials?: ProviderCredentials) {
    this.apiKey = credentials?.apiKey || process.env.MAILGUN_API_KEY || '';
    this.domain = credentials?.mailgunDomain || process.env.MAILGUN_DOMAIN || '';
    this.region = (credentials?.mailgunRegion as 'US' | 'EU') || 'US';
  }

  private getBaseUrl(): string {
    return this.region === 'EU' ? 'https://api.eu.mailgun.net/v3' : 'https://api.mailgun.net/v3';
  }

  private getAuthHeader(): string {
    const auth = Buffer.from(`api:${this.apiKey}`).toString('base64');
    return `Basic ${auth}`;
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const baseUrl = this.getBaseUrl();
      const endpoint = this.domain
        ? `${baseUrl}/domains/${encodeURIComponent(this.domain)}`
        : `${baseUrl}/domains`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      return res.status === 200;
    } catch {
      return false;
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          provider: 'MAILGUN',
          sentCount: 0,
          error: 'Missing Mailgun API Key',
        };
      }

      const domain = this.domain || (options.fromEmail.includes('@') ? options.fromEmail.split('@')[1] : '');
      if (!domain) {
        return {
          success: false,
          provider: 'MAILGUN',
          sentCount: 0,
          error: 'Missing Mailgun sending domain',
        };
      }

      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'MAILGUN',
          sentCount: 0,
          error: 'No recipients provided for Mailgun dispatch',
        };
      }

      const baseUrl = this.getBaseUrl();
      const recipientEmails = options.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email));

      const params = new URLSearchParams();
      params.append('from', `"${options.fromName}" <${options.fromEmail}>`);
      recipientEmails.forEach((to) => params.append('to', to));
      params.append('subject', options.subject);
      params.append('html', options.htmlContent);
      if (options.plainTextContent) {
        params.append('text', options.plainTextContent);
      }
      if (options.replyTo) {
        params.append('h:Reply-To', options.replyTo);
      }

      if (options.tracking) {
        params.append('o:tracking', 'yes');
        params.append('o:tracking-clicks', options.tracking.enableClicks ? 'yes' : 'no');
        params.append('o:tracking-opens', options.tracking.enableOpens ? 'yes' : 'no');
        if (options.tracking.campaignId) {
          params.append('v:campaignId', options.tracking.campaignId);
        }
      }

      const res = await fetch(`${baseUrl}/${encodeURIComponent(domain)}/messages`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        return {
          success: false,
          provider: 'MAILGUN',
          sentCount: 0,
          error: `Mailgun API error (${res.status}): ${errBody || res.statusText}`,
        };
      }

      const data: any = await res.json().catch(() => ({}));
      const messageId = data?.id ? data.id.replace(/[<>]/g, '') : undefined;

      return {
        success: true,
        provider: 'MAILGUN',
        providerMessageId: messageId,
        sentCount: options.to.length,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'MAILGUN',
        sentCount: 0,
        error: err?.message || 'Mailgun network dispatch error',
      };
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    if (!this.apiKey) return [];

    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/domains`, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (!res.ok) return [];
      const data: any = await res.json().catch(() => ({}));
      const items: any[] = data?.items || [];

      return items.map((item) => {
        const domainName = item.name || '';
        const isVerified = item.state === 'active';
        return {
          fromEmail: `sales@${domainName}`,
          fromName: `${domainName.split('.')[0].toUpperCase()} Sales`,
          domain: domainName,
          isVerified,
          providerId: item.id || domainName,
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
      return { isVerified: false, reason: 'Missing Mailgun API Key' };
    }
    if (!clean) {
      return { isVerified: false, reason: 'Email or domain is required' };
    }

    const domain = clean.includes('@') ? clean.split('@')[1] : clean;

    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/domains/${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      if (res.status === 200) {
        const data: any = await res.json().catch(() => ({}));
        const d = data?.domain;
        const isActive = d?.state === 'active';

        return {
          isVerified: isActive,
          fromEmail: clean.includes('@') ? clean : `sales@${domain}`,
          domain,
          reason: isActive ? undefined : 'Domain DNS records (SPF/DKIM) pending validation in Mailgun',
        };
      }

      return {
        isVerified: false,
        reason: `Domain ${domain} not found in Mailgun account`,
      };
    } catch (err: any) {
      return {
        isVerified: false,
        reason: err?.message || 'Failed to verify domain with Mailgun',
      };
    }
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class MailgunWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];
    const eventData = payload?.['event-data'];
    if (!eventData) return events;

    const eventName = eventData.event;
    const recipient = eventData.recipient;
    const messageId = eventData.message?.headers?.['message-id']?.replace(/[<>]/g, '') || eventData.id;
    const campaignId = eventData['user-variables']?.campaignId;
    const timestamp = eventData.timestamp ? new Date(eventData.timestamp * 1000) : new Date();

    let eventType: EmailWebhookEvent['eventType'] | null = null;
    let bounceReason: string | undefined;

    switch (eventName) {
      case 'delivered':
        eventType = 'DELIVERED';
        break;
      case 'opened':
        eventType = 'OPENED';
        break;
      case 'clicked':
        eventType = 'CLICKED';
        break;
      case 'failed':
        eventType = 'BOUNCED';
        bounceReason = eventData['delivery-status']?.description || eventData.reason;
        break;
      case 'complained':
        eventType = 'SPAM_COMPLAINT';
        break;
      case 'unsubscribed':
        eventType = 'UNSUBSCRIBED';
        break;
      default:
        break;
    }

    if (eventType && recipient) {
      events.push({
        providerMessageId: messageId,
        campaignId,
        recipientEmail: recipient.toLowerCase().trim(),
        eventType,
        timestamp,
        metadata: {
          linkUrl: eventData.url,
          bounceReason,
          ip: eventData.ip,
          userAgent: eventData['client-info']?.['user-agent'],
        },
      });
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class MailgunAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'MAILGUN';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new MailgunClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new MailgunClient(credentials);
    return client.send(options);
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new MailgunClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new MailgunClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return MailgunWebhookParser.parse(headers, payload);
  }
}
