import { describe, it, expect } from 'vitest';
import {
  CreateLeadSchema,
  CreateCampaignSchema,
  PhoneSchema,
  SiteVisitVerificationSchema,
} from '../index.js';

describe('@brokeros/validators — Zod Schema Tests', () => {
  describe('PhoneSchema', () => {
    it('accepts valid E.164 international numbers', () => {
      expect(() => PhoneSchema.parse('+919800000000')).not.toThrow();
      expect(() => PhoneSchema.parse('9800000000')).not.toThrow();
      expect(() => PhoneSchema.parse('+14155555555')).not.toThrow();
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(() => PhoneSchema.parse('1234')).toThrow(/Phone number too short/);
      expect(() => PhoneSchema.parse('abc1234567')).toThrow(/Invalid international E.164/);
      expect(() => PhoneSchema.parse('')).toThrow();
    });
  });

  describe('CreateLeadSchema', () => {
    it('validates a complete lead payload successfully', () => {
      const payload = {
        name: 'Suresh Menon',
        phone: '+919800000000',
        email: 'suresh@example.com',
        city: 'Bangalore',
        budget: 25000000,
        temperature: 'HOT',
        status: 'NEW',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const parsed = CreateLeadSchema.parse(payload);
      expect(parsed.name).toBe('Suresh Menon');
      expect(parsed.temperature).toBe('HOT');
      expect(parsed.budget).toBe(25000000);
    });

    it('defaults temperature to WARM and status to NEW', () => {
      const payload = {
        name: 'Kavita Rao',
        phone: '+919800000005',
      };

      const parsed = CreateLeadSchema.parse(payload);
      expect(parsed.temperature).toBe('WARM');
      expect(parsed.status).toBe('NEW');
    });

    it('rejects payload with missing name or invalid email', () => {
      expect(() =>
        CreateLeadSchema.parse({
          name: '',
          phone: '+919800000000',
        }),
      ).toThrow(/Name must be at least 2 characters/);

      expect(() =>
        CreateLeadSchema.parse({
          name: 'Valid Name',
          phone: '+919800000000',
          email: 'not-an-email',
        }),
      ).toThrow(/Invalid email address/);
    });

    it('rejects negative budget numbers', () => {
      expect(() =>
        CreateLeadSchema.parse({
          name: 'Valid Name',
          phone: '+919800000000',
          budget: -500,
        }),
      ).toThrow(/Budget must be a positive number/);
    });
  });

  describe('CreateCampaignSchema', () => {
    it('validates a valid voice campaign payload', () => {
      const payload = {
        title: 'Q3 Luxury Launch Broadcast',
        channel: 'VOICE',
        isCpCampaign: false,
        audienceSource: 'CRM_DATABASE',
        scriptPrompt: 'Hello {{lead.name}}, introducing Skyline Luxuria penthouses.',
      };

      const parsed = CreateCampaignSchema.parse(payload);
      expect(parsed.title).toBe('Q3 Luxury Launch Broadcast');
      expect(parsed.channel).toBe('VOICE');
      expect(parsed.isCpCampaign).toBe(false);
    });

    it('rejects invalid channel type', () => {
      expect(() =>
        CreateCampaignSchema.parse({
          title: 'Direct Mailers',
          channel: 'POSTAL_MAIL' as any,
        }),
      ).toThrow();
    });
  });

  describe('SiteVisitVerificationSchema', () => {
    it('validates valid GPS coordinates and selfie URL', () => {
      const payload = {
        siteVisitId: '123e4567-e89b-12d3-a456-426614174000',
        latitude: 19.076,
        longitude: 72.8777,
        selfieUrl: 'https://storage.brokeros.io/selfies/visit-123.jpg',
      };

      const parsed = SiteVisitVerificationSchema.parse(payload);
      expect(parsed.latitude).toBe(19.076);
      expect(parsed.longitude).toBe(72.8777);
    });

    it('rejects out-of-range GPS coordinates', () => {
      expect(() =>
        SiteVisitVerificationSchema.parse({
          siteVisitId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 195.0, // max is 90
          longitude: 72.0,
          selfieUrl: 'https://storage.brokeros.io/selfies/visit-123.jpg',
        }),
      ).toThrow(/Invalid latitude/);
    });
  });
});
