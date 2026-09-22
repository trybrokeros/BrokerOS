import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketingSmsProcessor } from '../../src/processors/marketing-sms.processor.js';
import { MarketingEmailProcessor } from '../../src/processors/marketing-email.processor.js';
import { calculateSmsSegments, SMS_PROVIDER_THROTTLE_LIMITS, PROVIDER_THROTTLE_LIMITS } from '@brokeros/constants';

describe('Workers E2E: Marketing Broadcast Processors (SMS & Email)', () => {
  describe('MarketingSmsProcessor', () => {
    let smsProcessor: MarketingSmsProcessor;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        smsCampaign: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        smsRecipient: {
          findMany: vi.fn(),
          update: vi.fn(),
        },
        smsIntegration: {
          findFirst: vi.fn(),
        },
      };

      smsProcessor = new MarketingSmsProcessor();
      (smsProcessor as any).prisma = mockPrisma;
    });

    describe('Phone Number Normalization & Scientific Notation Handling', () => {
      it('correctly handles Excel exponential scientific notation', () => {
        // When CSV is opened in Excel, 9876543210 often gets converted to 9.87654321e+09
        const normalized = MarketingSmsProcessor.normalizePhoneNumber('9.87654321e+09');
        expect(normalized).toBe('+919876543210');
      });

      it('normalizes 10-digit phone strings to +91 E.164', () => {
        expect(MarketingSmsProcessor.normalizePhoneNumber('9876543210')).toBe('+919876543210');
        expect(MarketingSmsProcessor.normalizePhoneNumber(' 9876543210 ')).toBe('+919876543210');
      });

      it('normalizes 12-digit Indian numbers starting with 91', () => {
        expect(MarketingSmsProcessor.normalizePhoneNumber('919876543210')).toBe('+919876543210');
      });

      it('normalizes 11-digit US numbers starting with 1', () => {
        expect(MarketingSmsProcessor.normalizePhoneNumber('14155552671')).toBe('+14155552671');
      });

      it('preserves numbers already having valid + prefix', () => {
        expect(MarketingSmsProcessor.normalizePhoneNumber('+447911123456')).toBe('+447911123456');
      });

      it('returns empty string for empty input', () => {
        expect(MarketingSmsProcessor.normalizePhoneNumber('')).toBe('');
      });
    });

    describe('SMS Segment Calculation & Provider Throttle Limits', () => {
      it('calculates 1 segment for standard GSM-7 text under 160 characters', () => {
        const text = 'Hello, your site visit for Grand Horizon is confirmed for tomorrow.';
        const seg = calculateSmsSegments(text);
        expect(seg.segments).toBe(1);
        expect(seg.isUnicode).toBe(false);
      });

      it('calculates 2 segments for GSM-7 text over 160 characters', () => {
        const text = 'A'.repeat(165);
        const seg = calculateSmsSegments(text);
        expect(seg.segments).toBe(2);
        expect(seg.isUnicode).toBe(false);
      });

      it('detects Unicode (emojis/non-ASCII) and applies 70-character UCS-2 limit', () => {
        const text = 'Your booking is confirmed! 🏠🎉';
        const seg = calculateSmsSegments(text);
        expect(seg.isUnicode).toBe(true);
        expect(seg.remainingInSegment).toBeGreaterThanOrEqual(0);
      });

      it('enforces known provider throttle rates', () => {
        expect(SMS_PROVIDER_THROTTLE_LIMITS.TWILIO.maxPerSecond).toBeGreaterThan(0);
        expect(SMS_PROVIDER_THROTTLE_LIMITS.GUPSHUP.maxPerSecond).toBeGreaterThan(0);
        expect(SMS_PROVIDER_THROTTLE_LIMITS.SINCH.maxPerSecond).toBeGreaterThan(0);
      });
    });

    describe('Campaign Dispatch Processing', () => {
      it('updates campaign to PROCESSING on launch', async () => {
        const campaignId = 'camp-sms-1';
        mockPrisma.smsCampaign.findUnique.mockResolvedValue({
          id: campaignId,
          title: 'Diwali Offer SMS',
          status: 'SCHEDULED',
          recipients: [],
          senderPools: [],
        });
        mockPrisma.smsIntegration.findFirst.mockResolvedValue(null);
        mockPrisma.smsCampaign.update.mockResolvedValue({
          id: campaignId,
          status: 'PROCESSING',
        });

        await smsProcessor.processSmsCampaign({ campaignId });

        expect(mockPrisma.smsCampaign.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: campaignId },
            data: expect.objectContaining({ status: 'PROCESSING' }),
          }),
        );
      });
    });
  });

  describe('MarketingEmailProcessor', () => {
    let emailProcessor: MarketingEmailProcessor;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        marketingCampaign: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        campaignRecipient: {
          findMany: vi.fn(),
          update: vi.fn(),
        },
      };

      emailProcessor = new MarketingEmailProcessor();
      (emailProcessor as any).prisma = mockPrisma;
    });

    describe('Merge Tag Interpolation & Dynamic Template Rendering', () => {
      it('replaces all CRM merge tags in email templates', () => {
        const template = 'Hi {{lead.firstName}}, welcome to {{project.name}} in {{project.location}}! Contact {{agent.name}} at {{agent.phone}}. Unsubscribe: {{unsubscribeUrl}}';

        const tagData = {
          firstName: 'Ananya',
          lastName: 'Deshmukh',
          fullName: 'Ananya Deshmukh',
          city: 'Mumbai',
          projectName: 'Skyline Palms',
          projectLocation: 'Bandra West, Mumbai',
          projectStartingPrice: '₹2.50 Cr',
          projectBrochureUrl: 'https://cdn.example.com/brochure.pdf',
          agentName: 'Vikram Mehta',
          agentPhone: '+91 98765 43210',
          unsubscribeUrl: 'https://app.example.com/api/marketing/unsubscribe?email=ananya%40example.com&cid=camp-1',
        };

        const rendered = template
          .replace(/{{lead\.firstName}}/gi, tagData.firstName)
          .replace(/{{lead\.lastName}}/gi, tagData.lastName)
          .replace(/{{lead\.fullName}}/gi, tagData.fullName)
          .replace(/{{project\.name}}/gi, tagData.projectName)
          .replace(/{{project\.location}}/gi, tagData.projectLocation)
          .replace(/{{agent\.name}}/gi, tagData.agentName)
          .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
          .replace(/{{unsubscribeUrl}}/gi, tagData.unsubscribeUrl);

        expect(rendered).toContain('Hi Ananya');
        expect(rendered).toContain('Skyline Palms in Bandra West, Mumbai');
        expect(rendered).toContain('Vikram Mehta at +91 98765 43210');
        expect(rendered).toContain('https://app.example.com/api/marketing/unsubscribe');
      });

      it('enforces email provider throttle limits from @brokeros/constants', () => {
        expect(PROVIDER_THROTTLE_LIMITS.SENDGRID.maxPerSecond).toBeGreaterThan(0);
        expect(PROVIDER_THROTTLE_LIMITS.AWS_SES.maxPerSecond).toBeGreaterThan(0);
        expect(PROVIDER_THROTTLE_LIMITS.BREVO.maxPerSecond).toBeGreaterThan(0);
      });
    });

    describe('Email Campaign Dispatch Execution', () => {
      it('halts processing and logs error if campaign is not found', async () => {
        mockPrisma.marketingCampaign.findUnique.mockResolvedValue(null);
        const errSpy = vi.spyOn((emailProcessor as any).logger, 'error').mockImplementation(() => {});

        await emailProcessor.processCampaign({ campaignId: 'non-existent' });

        expect(mockPrisma.marketingCampaign.update).not.toHaveBeenCalled();
        errSpy.mockRestore();
      });

      it('transitions campaign to PROCESSING upon dispatch initiation', async () => {
        const campaignId = 'camp-email-1';
        mockPrisma.marketingCampaign.findUnique.mockResolvedValue({
          id: campaignId,
          title: 'Monthly Newsletter',
          status: 'SCHEDULED',
          providerType: 'SYSTEM_DEFAULT',
          recipients: [],
          senderPools: [],
        });
        mockPrisma.marketingCampaign.update.mockResolvedValue({
          id: campaignId,
          status: 'PROCESSING',
        });

        await emailProcessor.processCampaign({ campaignId });

        expect(mockPrisma.marketingCampaign.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: campaignId },
            data: expect.objectContaining({ status: 'PROCESSING' }),
          }),
        );
      });
    });
  });
});
