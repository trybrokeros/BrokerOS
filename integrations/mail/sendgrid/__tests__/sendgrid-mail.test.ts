import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendgridAdapter, SendgridWebhookParser } from '../src/index.js';

describe('Integrations: SendGrid Email Adapter', () => {
  let adapter: SendgridAdapter;

  beforeEach(() => {
    adapter = new SendgridAdapter();
    vi.restoreAllMocks();
  });

  describe('Credential Validation', () => {
    it('returns false for empty or malformed API key', async () => {
      const valid = await adapter.validateCredentials({
        apiKey: '',
      });
      expect(valid).toBe(false);
    });

    it('returns true when SendGrid API responds with valid profile (200 OK)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
        }),
      );

      const valid = await adapter.validateCredentials({
        apiKey: 'SG.' + 'a'.repeat(30),
      });

      expect(valid).toBe(true);
    });
  });

  describe('Webhook Event Parsing', () => {
    it('parses delivered event payload', () => {
      const payload = [
        {
          email: 'client@example.com',
          timestamp: 1672531199,
          event: 'delivered',
          sg_message_id: 'sg_msg_123',
        },
      ];

      const events = adapter.parseWebhookEvent({}, payload);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('DELIVERED');
      expect(events[0].recipientEmail).toBe('client@example.com');
      expect(events[0].providerMessageId).toBe('sg_msg_123');
    });

    it('parses bounce event with reason', () => {
      const payload = [
        {
          email: 'bounced@example.com',
          timestamp: 1672531199,
          event: 'bounce',
          sg_message_id: 'sg_msg_999',
          reason: '550 User mailbox not found',
        },
      ];

      const events = adapter.parseWebhookEvent({}, payload);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('BOUNCED');
      expect(events[0].metadata?.bounceReason).toBe('550 User mailbox not found');
    });

    it('parses open and click engagement events', () => {
      const payload = [
        {
          email: 'active@example.com',
          timestamp: 1672531199,
          event: 'open',
          sg_message_id: 'sg_msg_open_1',
        },
        {
          email: 'active@example.com',
          timestamp: 1672531200,
          event: 'click',
          sg_message_id: 'sg_msg_click_1',
          url: 'https://example.com/penthouse',
        },
      ];

      const events = adapter.parseWebhookEvent({}, payload);

      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('OPENED');
      expect(events[1].eventType).toBe('CLICKED');
      expect(events[1].metadata?.linkUrl).toBe('https://example.com/penthouse');
    });
  });
});
