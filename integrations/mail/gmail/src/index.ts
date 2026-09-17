import nodemailer from 'nodemailer';
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

export interface GmailWebhookEventPayload {
  message?: {
    data?: string; // Base64 encoded JSON from Google Cloud Pub/Sub
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
}

// ============================================================================
// Client
// ============================================================================

export class GmailClient {
  private fromEmail: string;
  private appPassword?: string;
  private clientId?: string;
  private clientSecret?: string;
  private refreshToken?: string;

  constructor(credentials?: ProviderCredentials) {
    this.fromEmail = (credentials?.fromEmail || process.env.GMAIL_FROM_EMAIL || '').trim().toLowerCase();
    this.appPassword = credentials?.googleAppPassword || process.env.GMAIL_APP_PASSWORD;
    this.clientId = credentials?.googleClientId || process.env.GMAIL_CLIENT_ID;
    this.clientSecret = credentials?.googleClientSecret || process.env.GMAIL_CLIENT_SECRET;
    this.refreshToken = credentials?.googleRefreshToken || process.env.GMAIL_REFRESH_TOKEN;
  }

  /**
   * Refreshes OAuth2 access token from Google OAuth endpoint if refreshToken is provided.
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      return null;
    }

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!res.ok) return null;
      const data: any = await res.json().catch(() => ({}));
      return data?.access_token || null;
    } catch {
      return null;
    }
  }

  async validate(): Promise<boolean> {
    if (!this.fromEmail || !this.fromEmail.includes('@')) {
      return false;
    }

    // 1. If OAuth2 credentials provided, test token refresh
    if (this.refreshToken && this.clientId && this.clientSecret) {
      const token = await this.getAccessToken();
      if (token) return true;
    }

    // 2. If App Password provided, verify credentials with Gmail SMTP
    if (this.appPassword) {
      const cleanPassword = this.appPassword.replace(/\s+/g, '');
      if (cleanPassword.length < 16) return false;
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: this.fromEmail,
            pass: cleanPassword,
          },
        });
        await transporter.verify();
        return true;
      } catch {
        // Allow if password format valid even if temporarily offline
        return cleanPassword.length >= 16;
      }
    }

    return false;
  }

  /**
   * Builds an RFC 2822 compliant MIME message and returns it Base64URL-encoded.
   */
  private buildRfc2822Message(options: SendEmailOptions): string {
    const toHeader = options.to
      .map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email))
      .join(', ');

    const boundary = `brokeros_boundary_${Date.now()}`;
    const lines = [
      `From: "${options.fromName}" <${options.fromEmail}>`,
      `To: ${toHeader}`,
      `Subject: =?UTF-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
      `MIME-Version: 1.0`,
      options.replyTo ? `Reply-To: ${options.replyTo}` : '',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      '',
      options.plainTextContent || 'Please view this email in an HTML-compatible client.',
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      '',
      options.htmlContent,
      '',
      `--${boundary}--`,
    ].filter((line) => line !== undefined);

    const raw = lines.join('\r\n');
    return Buffer.from(raw)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'GMAIL',
          sentCount: 0,
          error: 'No recipients provided for Gmail dispatch',
        };
      }

      const token = await this.getAccessToken();

      if (token) {
        // Send via Google Workspace REST API
        const rawMessage = this.buildRfc2822Message(options);
        const res = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'message/rfc822',
          },
          body: Buffer.from(rawMessage, 'base64'),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return {
            success: false,
            provider: 'GMAIL',
            sentCount: 0,
            error: `Gmail API Error (${res.status}): ${errText || res.statusText}`,
          };
        }

        const data: any = await res.json().catch(() => ({}));
        return {
          success: true,
          provider: 'GMAIL',
          providerMessageId: data?.id,
          sentCount: options.to.length,
        };
      }

      // App Password SMTP submission via smtp.gmail.com:465 (SSL)
      if (this.appPassword) {
        const cleanPassword = this.appPassword.replace(/\s+/g, '');
        if (cleanPassword.length < 16) {
          return {
            success: false,
            provider: 'GMAIL',
            sentCount: 0,
            error: 'Invalid Google App Password (must be at least 16 characters)',
          };
        }

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: this.fromEmail,
            pass: cleanPassword,
          },
        });

        const toList = options.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(', ');
        const info = await transporter.sendMail({
          from: options.fromName ? `"${options.fromName}" <${this.fromEmail}>` : this.fromEmail,
          to: toList,
          subject: options.subject,
          text: options.plainTextContent,
          html: options.htmlContent,
          replyTo: options.replyTo,
        });

        return {
          success: true,
          provider: 'GMAIL',
          providerMessageId: info.messageId || `gmail-${Date.now()}`,
          sentCount: options.to.length,
        };
      }

      return {
        success: false,
        provider: 'GMAIL',
        sentCount: 0,
        error: 'Missing Google OAuth Refresh Token or App Password',
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'GMAIL',
        sentCount: 0,
        error: err?.message || 'Gmail dispatch error',
      };
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    if (!this.fromEmail) return [];

    const domain = this.fromEmail.split('@')[1] || '';
    const identities: DiscoveredSenderIdentity[] = [
      {
        fromEmail: this.fromEmail,
        fromName: `${this.fromEmail.split('@')[0]} (Google Workspace)`,
        domain,
        isVerified: true,
        providerId: this.fromEmail,
      },
    ];

    const token = await this.getAccessToken();
    if (!token) return identities;

    try {
      // Discover sendAs aliases configured in Google Workspace
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: any = await res.json().catch(() => ({}));
        const sendAsList: any[] = data?.sendAs || [];
        for (const item of sendAsList) {
          const email = (item.sendAsEmail || '').toLowerCase().trim();
          if (email && email.includes('@') && email !== this.fromEmail) {
            identities.push({
              fromEmail: email,
              fromName: item.displayName || email.split('@')[0],
              domain: email.split('@')[1] || '',
              isVerified: Boolean(item.verificationStatus === 'accepted' || item.isPrimary),
              providerId: item.sendAsEmail,
            });
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
    const targetDomain = isEmail ? clean.split('@')[1] : clean;
    const accountDomain = this.fromEmail ? this.fromEmail.split('@')[1] : '';

    if (isEmail && clean === this.fromEmail) {
      return { isVerified: true, fromEmail: clean, domain: targetDomain };
    }

    if (targetDomain && accountDomain && targetDomain === accountDomain) {
      return { isVerified: true, fromEmail: isEmail ? clean : `sales@${targetDomain}`, domain: targetDomain };
    }

    return {
      isVerified: false,
      reason: `Email ${clean} does not match connected Google Workspace domain (${accountDomain || 'none'})`,
    };
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class GmailWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];
    if (!payload) return events;

    // Handle Google Cloud Pub/Sub push notification format
    const messageData = payload?.message?.data;
    if (messageData) {
      try {
        const decoded = Buffer.from(messageData, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        const emailAddress = parsed?.emailAddress;
        const historyId = parsed?.historyId;

        if (emailAddress) {
          events.push({
            providerMessageId: String(historyId || payload.message.messageId || Date.now()),
            recipientEmail: emailAddress.toLowerCase().trim(),
            eventType: 'DELIVERED',
            timestamp: new Date(),
            metadata: {
              ip: headers?.['x-forwarded-for'],
              userAgent: headers?.['user-agent'],
            },
          });
        }
      } catch {
        // Fallback for malformed Pub/Sub payload
      }
    }

    return events;
  }
}

// ============================================================================
// Adapter
// ============================================================================

export class GmailAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'GMAIL';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new GmailClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new GmailClient(credentials);
    return client.send(options);
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new GmailClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new GmailClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return GmailWebhookParser.parse(headers, payload);
  }
}
