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

export interface OutlookGraphNotificationPayload {
  value?: Array<{
    subscriptionId: string;
    clientState?: string;
    changeType: 'created' | 'updated' | 'deleted';
    resource: string;
    resourceData?: {
      id?: string;
      '@odata.type'?: string;
      '@odata.id'?: string;
    };
  }>;
}

// ============================================================================
// Client
// ============================================================================

export class OutlookClient {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken?: string;
  private fromEmail: string;

  constructor(credentials?: ProviderCredentials) {
    this.tenantId = (credentials?.microsoftTenantId || process.env.OUTLOOK_TENANT_ID || 'common').trim();
    this.clientId = (credentials?.microsoftClientId || process.env.OUTLOOK_CLIENT_ID || '').trim();
    this.clientSecret = (credentials?.microsoftClientSecret || process.env.OUTLOOK_CLIENT_SECRET || '').trim();
    this.refreshToken = credentials?.microsoftRefreshToken || process.env.OUTLOOK_REFRESH_TOKEN;
    this.fromEmail = (credentials?.fromEmail || process.env.OUTLOOK_FROM_EMAIL || '').trim().toLowerCase();
  }

  /**
   * Refreshes OAuth2 access token from Microsoft Azure AD endpoint.
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      return null;
    }

    try {
      const res = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite offline_access',
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
    if (!this.clientId) return false;

    // 1. If refresh token is available, test live token renewal and ping Microsoft Graph /v1.0/me
    if (this.refreshToken && this.clientSecret) {
      const token = await this.getAccessToken();
      if (!token) return false;

      try {
        const res = await fetch('https://graph.microsoft.com/v1.0/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.status === 200;
      } catch {
        return false;
      }
    }

    // 2. Format validation fallback
    return this.clientId.length > 10;
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      if (!options.to || options.to.length === 0) {
        return {
          success: false,
          provider: 'OUTLOOK',
          sentCount: 0,
          error: 'No recipients provided for Outlook dispatch',
        };
      }

      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          provider: 'OUTLOOK',
          sentCount: 0,
          error: 'Failed to authenticate with Microsoft Graph API (invalid refresh token or secret)',
        };
      }

      const toRecipients = options.to.map((t) => ({
        emailAddress: {
          address: t.email,
          name: t.name || t.email.split('@')[0],
        },
      }));

      const payload: any = {
        message: {
          subject: options.subject,
          body: {
            contentType: 'HTML',
            content: options.htmlContent,
          },
          toRecipients,
          from: {
            emailAddress: {
              address: options.fromEmail,
              name: options.fromName,
            },
          },
        },
        saveToSentItems: 'true',
      };

      if (options.replyTo) {
        payload.message.replyTo = [
          {
            emailAddress: {
              address: options.replyTo,
            },
          },
        ];
      }

      const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok && res.status !== 202) {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          provider: 'OUTLOOK',
          sentCount: 0,
          error: `Microsoft Graph API error (${res.status}): ${errText || res.statusText}`,
        };
      }

      const syntheticId = `ms365-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return {
        success: true,
        provider: 'OUTLOOK',
        providerMessageId: syntheticId,
        sentCount: options.to.length,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'OUTLOOK',
        sentCount: 0,
        error: err?.message || 'Microsoft 365 dispatch error',
      };
    }
  }

  async listVerifiedSenders(): Promise<DiscoveredSenderIdentity[]> {
    const identities: DiscoveredSenderIdentity[] = [];
    if (this.fromEmail) {
      identities.push({
        fromEmail: this.fromEmail,
        fromName: `${this.fromEmail.split('@')[0]} (Microsoft 365)`,
        domain: this.fromEmail.split('@')[1] || '',
        isVerified: true,
        providerId: this.fromEmail,
      });
    }

    const token = await this.getAccessToken();
    if (!token) return identities;

    try {
      const res = await fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const profile = await res.json().catch(() => ({}));
        const mail = (profile.mail || profile.userPrincipalName || '').toLowerCase().trim();
        if (mail && mail.includes('@')) {
          const exists = identities.some((i) => i.fromEmail === mail);
          if (!exists) {
            identities.push({
              fromEmail: mail,
              fromName: profile.displayName || mail.split('@')[0],
              domain: mail.split('@')[1] || '',
              isVerified: true,
              providerId: profile.id || mail,
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
      reason: `Sender domain ${targetDomain} does not match configured Microsoft 365 tenant (${accountDomain || 'none'})`,
    };
  }
}

// ============================================================================
// Webhook Parser
// ============================================================================

export class OutlookWebhookParser {
  static parse(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    const events: EmailWebhookEvent[] = [];
    const notifications = (Array.isArray(payload?.value) ? payload.value : []) as NonNullable<OutlookGraphNotificationPayload['value']>;

    for (const item of notifications) {
      if (item.changeType === 'created' || item.changeType === 'updated') {
        events.push({
          providerMessageId: item.resourceData?.id || item.subscriptionId,
          recipientEmail: 'mailbox@microsoft365.tenant',
          eventType: 'DELIVERED',
          timestamp: new Date(),
          metadata: {
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

export class OutlookAdapter implements IEmailMarketingProvider {
  readonly providerType: EmailProviderType = 'OUTLOOK';

  async validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const client = new OutlookClient(credentials);
    return client.validate();
  }

  async sendBatch(options: SendEmailOptions, credentials?: ProviderCredentials): Promise<SendEmailResult> {
    const client = new OutlookClient(credentials);
    return client.send(options);
  }

  async listVerifiedSenders(credentials?: ProviderCredentials): Promise<DiscoveredSenderIdentity[]> {
    const client = new OutlookClient(credentials);
    return client.listVerifiedSenders();
  }

  async verifySenderIdentity(
    emailOrDomain: string,
    credentials?: ProviderCredentials,
  ): Promise<{ isVerified: boolean; fromEmail?: string; domain?: string; reason?: string }> {
    const client = new OutlookClient(credentials);
    return client.verifySenderIdentity(emailOrDomain);
  }

  parseWebhookEvent(headers: Record<string, any>, payload: any): EmailWebhookEvent[] {
    return OutlookWebhookParser.parse(headers, payload);
  }
}
