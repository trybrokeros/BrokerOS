import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { verifyMetaWebhookSignature } from '../src/webhook-sign.js';
import {
  sanitizePhoneForMeta,
  normalizePhone,
  isValidE164,
  phonesMatch,
  phoneVariants,
  isRecipientNotAllowedError,
} from '../src/phone-utils.js';
import { isPrivateOrReservedIp } from '../src/ssrf-guard.js';

describe('@brokeros/int-whatsapp — Integration Security & Utility Tests', () => {
  describe('Meta Webhook Signature Verification', () => {
    const secret = 'test_app_secret_brokeros_123456';
    const payload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ id: '10001', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp' } }] }],
    });

    it('verifies a genuine HMAC-SHA256 signature from Meta', () => {
      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const signatureHeader = `sha256=${hash}`;

      const isValid = verifyMetaWebhookSignature(payload, signatureHeader, secret);
      expect(isValid).toBe(true);
    });

    it('rejects a tampered payload with genuine signature header', () => {
      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const signatureHeader = `sha256=${hash}`;
      const tamperedPayload = payload + ' ';

      const isValid = verifyMetaWebhookSignature(tamperedPayload, signatureHeader, secret);
      expect(isValid).toBe(false);
    });

    it('rejects missing or malformed signature header', () => {
      expect(verifyMetaWebhookSignature(payload, null, secret)).toBe(false);
      expect(verifyMetaWebhookSignature(payload, 'invalid-prefix-hex', secret)).toBe(false);
    });
  });

  describe('Phone Utilities', () => {
    it('sanitizes phone number for Meta API (strips +, spaces, dashes)', () => {
      expect(sanitizePhoneForMeta('+91 9800000000')).toBe('919800000000');
      expect(sanitizePhoneForMeta('(415) 555-2671')).toBe('4155552671');
    });

    it('validates E.164 phone formats', () => {
      expect(isValidE164('+919800000000')).toBe(true);
      expect(isValidE164('919800000000')).toBe(true);
      expect(isValidE164('1234')).toBe(false);
      expect(isValidE164('+0123456789')).toBe(false);
    });

    it('matches phone numbers across trunk prefix differences', () => {
      expect(phonesMatch('+919800000000', '919800000000')).toBe(true);
      expect(phonesMatch('9109800000000', '919800000000')).toBe(true);
      expect(phonesMatch('+91 9800000000', '+91 8888888888')).toBe(false);
    });

    it('generates plausible retry variants for numbers with trunk 0', () => {
      const sanitized = sanitizePhoneForMeta('+9109800000000');
      const variants = phoneVariants(sanitized);
      expect(variants).toContain('9109800000000');
      expect(variants).toContain('919800000000');
    });

    it('detects recipient not allowed error messages from Meta', () => {
      expect(isRecipientNotAllowedError('Error code 131026: message undeliverable')).toBe(true);
      expect(isRecipientNotAllowedError('User is not in allowed list')).toBe(true);
      expect(isRecipientNotAllowedError('Rate limit exceeded')).toBe(false);
    });
  });

  describe('SSRF Protection Guard', () => {
    it('blocks dangerous private IPv4 addresses and cloud metadata', () => {
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true); // AWS/GCP metadata endpoint
      expect(isPrivateOrReservedIp('172.16.0.5')).toBe(true);
    });

    it('blocks IPv6 loopback and private addresses', () => {
      expect(isPrivateOrReservedIp('::1')).toBe(true);
      expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
    });

    it('allows valid public routable IP addresses', () => {
      expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIp('104.244.42.1')).toBe(false);
    });
  });
});
