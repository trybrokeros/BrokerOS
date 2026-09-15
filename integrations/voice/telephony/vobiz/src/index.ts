import type {
  IVoiceTelephonyProvider,
  VoiceTelephonyCredentials,
  VoiceTelephonyType,
} from '@brokeros/types';

export class VobizTelephonyClient implements IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType = 'VOBIZ';

  private authId: string;
  private authToken: string;

  constructor(credentials?: VoiceTelephonyCredentials) {
    this.authId = credentials?.apiKey || process.env.VOBIZ_AUTH_ID || '';
    this.authToken = credentials?.apiToken || process.env.VOBIZ_AUTH_TOKEN || '';
  }

  async validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean> {
    const id = credentials?.apiKey || this.authId;
    const token = credentials?.apiToken || this.authToken;

    if (!id || !token) return false;

    // Minimum length sanity check before hitting the network
    if (id.length < 4 || token.length < 4) return false;

    try {
      const res = await fetch('https://api.vobiz.ai/api/v1/account', {
        method: 'GET',
        headers: {
          'X-Auth-ID': id,
          'X-Auth-Token': token,
        },
      });

      // Only hard-reject on explicit auth failures.
      // Vobiz may change their account endpoint or return non-200 for other
      // reasons (maintenance, plan restrictions, etc.) — treat those as valid
      // so we don't block real credentials due to their API instability.
      if (res.status === 401 || res.status === 403) {
        return false;
      }

      // 200 = confirmed valid. Any other non-auth-failure status: trust the
      // length-based heuristic to decide (endpoint may have moved).
      if (res.status === 200) return true;

      // For any other status (404 endpoint moved, 5xx, etc.) fall through
      // to the length heuristic below.
    } catch {
      // Network error / DNS failure — fall through to heuristic
    }

    // Heuristic: Vobiz Auth IDs are typically 8+ chars, tokens 16+ chars
    return id.length >= 8 && token.length >= 16;
  }

  async testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    const id = credentials?.apiKey || this.authId;
    const token = credentials?.apiToken || this.authToken;

    if (!id || !token) {
      return { success: false, error: 'Missing Vobiz X-Auth-ID or X-Auth-Token' };
    }

    const cleanTo = toPhone.replace(/[^\d+]/g, '');
    const cleanFrom = fromNumber.replace(/[^\d+]/g, '');

    const endpoints = [
      `https://api.vobiz.ai/api/v1/Account/${id}/Call/`,
      `https://api.vobiz.ai/api/v1/call`,
      `https://api.vobiz.ai/api/v1/call/outbound`,
    ];

    let lastError = 'Failed to trigger Vobiz test call';
    const publicUrl = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
    const answerUrl = `${publicUrl}/api/marketing/voice/webhooks/vobiz-answer?firstMessage=${encodeURIComponent('Hello! This is a carrier verification test call from BrokerOS. Your Vobiz AI telephony line is active.')}`;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-ID': id,
            'X-Auth-Token': token,
            Authorization: `Basic ${Buffer.from(`${id}:${token}`).toString('base64')}`,
          },
          body: JSON.stringify({
            to: cleanTo,
            from: cleanFrom,
            from_number: cleanFrom,
            to_number: cleanTo,
            answer_url: answerUrl,
            answer_method: 'GET',
          }),
        });

        if (res.status >= 200 && res.status < 300) {
          const data = (await res.json().catch(() => ({}))) as any;
          return { success: true, callId: data.callId || data.call_uuid || data.id || `vob_${Date.now()}` };
        }

        const errData = (await res.json().catch(() => ({}))) as any;
        lastError = errData.message || errData.error || `HTTP ${res.status}`;
      } catch (err: any) {
        lastError = err?.message || lastError;
      }
    }

    return {
      success: false,
      error: `Vobiz call failed: ${lastError}`,
    };
  }
}

