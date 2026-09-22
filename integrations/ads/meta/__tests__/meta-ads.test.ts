import { describe, it, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import { MetaGraphApiClient } from '../src/client.js';

describe('@brokeros/int-ads-meta — Meta Ads Integration Tests', () => {
  const client = new MetaGraphApiClient();
  const appSecret = 'meta_test_app_secret_998877';

  describe('verifyWebhookSignature', () => {
    const rawPayload = JSON.stringify({
      object: 'page',
      entry: [
        {
          id: '123456789',
          time: 1710000000,
          changes: [
            {
              field: 'leadgen',
              value: {
                leadgen_id: 'lead_99999',
                page_id: '123456789',
                form_id: 'form_88888',
                ad_id: 'ad_77777',
              },
            },
          ],
        },
      ],
    });

    it('verifies genuine sha256 signature from Meta Graph Webhook', () => {
      const hash = crypto.createHmac('sha256', appSecret).update(rawPayload, 'utf8').digest('hex');
      const signature = `sha256=${hash}`;

      const isValid = client.verifyWebhookSignature(signature, rawPayload, appSecret);
      expect(isValid).toBe(true);
    });

    it('rejects tampered webhook body', () => {
      const hash = crypto.createHmac('sha256', appSecret).update(rawPayload, 'utf8').digest('hex');
      const signature = `sha256=${hash}`;
      const tampered = rawPayload + ' ';

      const isValid = client.verifyWebhookSignature(signature, tampered, appSecret);
      expect(isValid).toBe(false);
    });

    it('returns false for empty or missing signature', () => {
      expect(client.verifyWebhookSignature('', rawPayload, appSecret)).toBe(false);
      expect(client.verifyWebhookSignature('sha256=invalid', rawPayload, appSecret)).toBe(false);
    });
  });

  describe('getLeadDetails & Field Normalization', () => {
    it('normalizes Meta instant form fields into BrokerOS Lead DTO format', async () => {
      const mockLeadResponse = {
        id: 'lead_99999',
        created_time: '2026-03-20T10:00:00Z',
        ad_id: 'ad_77777',
        ad_name: 'Skyline Penthouse Spring Campaign',
        form_id: 'form_88888',
        page_id: 'page_12345',
        field_data: [
          { name: 'full_name', values: ['Sunil Gavaskar'] },
          { name: 'email', values: ['sunil.g@example.com'] },
          { name: 'phone_number', values: ['+919800000001'] },
          { name: 'city', values: ['Mumbai'] },
          { name: 'budget_range', values: ['₹25,000,000'] },
          { name: 'preferred_tower', values: ['Tower C'] },
        ],
      };

      // Mock global fetch for this test
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockLeadResponse,
      } as any);

      try {
        const lead = await client.getLeadDetails('lead_99999', 'test_page_token');

        expect(lead.id).toBe('lead_99999');
        expect(lead.fullName).toBe('Sunil Gavaskar');
        expect(lead.email).toBe('sunil.g@example.com');
        expect(lead.phoneNumber).toBe('+919800000001');
        expect(lead.city).toBe('Mumbai');
        expect(lead.budget).toBe(25000000);
        expect(lead.customFields.preferred_tower).toBe('Tower C');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
