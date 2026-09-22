import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TwilioSmsAdapter, TwilioSmsWebhookParser } from '../src/index.js';

describe('Integrations: Twilio SMS Adapter', () => {
  let adapter: TwilioSmsAdapter;

  beforeEach(() => {
    adapter = new TwilioSmsAdapter();
    vi.restoreAllMocks();
  });

  describe('Credential Validation', () => {
    it('returns false for missing AccountSid or AuthToken', async () => {
      const valid = await adapter.validateCredentials({
        accountSid: '',
        authToken: '',
      });
      expect(valid).toBe(false);
    });

    it('returns false for invalid AccountSid format', async () => {
      const valid = await adapter.validateCredentials({
        accountSid: 'INVALID_SID_WITHOUT_AC',
        authToken: 'a'.repeat(32),
      });
      expect(valid).toBe(false);
    });

    it('returns true when Twilio returns active account status', async () => {
      const validSid = 'AC' + '1'.repeat(32);
      const validToken = 'token_' + '2'.repeat(26);

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
          json: async () => ({ status: 'active' }),
        }),
      );

      const valid = await adapter.validateCredentials({
        accountSid: validSid,
        authToken: validToken,
      });

      expect(valid).toBe(true);
    });
  });

  describe('Webhook Parsing', () => {
    it('parses delivered delivery receipt event', () => {
      const payload = {
        MessageSid: 'SM1234567890',
        To: '+919876543210',
        MessageStatus: 'delivered',
      };

      const events = adapter.parseWebhookEvent({}, payload);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('DELIVERED');
      expect(events[0].providerMessageId).toBe('SM1234567890');
      expect(events[0].recipientPhone).toBe('+919876543210');
    });

    it('parses undelivered or failed status with error details', () => {
      const payload = {
        MessageSid: 'SM9999999999',
        To: '+919876543210',
        MessageStatus: 'failed',
        ErrorCode: '30008',
        ErrorMessage: 'Unknown error',
      };

      const events = adapter.parseWebhookEvent({}, payload);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('FAILED');
      expect(events[0].metadata?.reason).toBe('Unknown error');
    });

    it('parses inbound replies with from, to, and message body', () => {
      const payload = {
        From: '+919876543210',
        To: '+14155550199',
        Body: 'Interested in booking unit 301',
        MessageSid: 'SM_INBOUND_1',
      };

      const inbound = adapter.parseInboundMessage({}, payload);

      expect(inbound).not.toBeNull();
      expect(inbound?.fromPhone).toBe('+919876543210');
      expect(inbound?.textBody).toBe('Interested in booking unit 301');
      expect(inbound?.provider).toBe('TWILIO');
    });
  });
});
