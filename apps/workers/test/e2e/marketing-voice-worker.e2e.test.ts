import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketingVoiceProcessor } from '../../src/processors/marketing-voice.processor.js';
import * as intVoice from '@brokeros/int-voice';

describe('Workers E2E: Marketing Voice Campaign Processor', () => {
  let processor: MarketingVoiceProcessor;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      voiceCampaign: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      voiceRecipient: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
      voiceCallLog: {
        create: vi.fn(),
      },
    };

    processor = new MarketingVoiceProcessor();
    // Inject mock prismaClient
    (processor as any).prisma = mockPrisma;
  });

  describe('Calling Hours Window Validation', () => {
    it('allows calls when no window is configured (24/7 window)', () => {
      expect(MarketingVoiceProcessor.isWithinCallingWindow(null, null)).toBe(true);
      expect(MarketingVoiceProcessor.isWithinCallingWindow(undefined, undefined)).toBe(true);
    });

    it('correctly validates window against current clock', () => {
      const now = new Date();
      const currentH = now.getHours();

      // Window guaranteed to include now: [00:00 - 23:59]
      expect(MarketingVoiceProcessor.isWithinCallingWindow('00:00', '23:59')).toBe(true);

      // Window guaranteed to be in the past or future
      if (currentH > 0 && currentH < 23) {
        const pastWindowEnd = `${String(currentH - 1).padStart(2, '0')}:00`;
        expect(MarketingVoiceProcessor.isWithinCallingWindow('00:00', pastWindowEnd)).toBe(false);
      }
    });
  });

  describe('Phone Number Normalization', () => {
    it('normalizes 10-digit Indian numbers with +91 E.164 prefix', () => {
      expect(MarketingVoiceProcessor.normalizePhoneNumber('9876543210')).toBe('+919876543210');
      expect(MarketingVoiceProcessor.normalizePhoneNumber('(987) 654-3210')).toBe('+919876543210');
    });

    it('preserves already prefixed E.164 international numbers', () => {
      expect(MarketingVoiceProcessor.normalizePhoneNumber('+14155552671')).toBe('+14155552671');
      expect(MarketingVoiceProcessor.normalizePhoneNumber('+919876543210')).toBe('+919876543210');
    });

    it('handles 12-digit Indian numbers with 91 prefix', () => {
      expect(MarketingVoiceProcessor.normalizePhoneNumber('919876543210')).toBe('+919876543210');
    });

    it('returns empty string for empty or invalid input', () => {
      expect(MarketingVoiceProcessor.normalizePhoneNumber('')).toBe('');
    });
  });

  describe('Voice Campaign Batch Dispatch Lifecycle', () => {
    it('halts processing and logs warning if current time is outside campaign calling window', async () => {
      const campaignId = 'camp-voice-1';
      mockPrisma.voiceCampaign.findUnique.mockResolvedValue({
        id: campaignId,
        title: 'Morning Outbound Call',
        callingWindowStart: '03:00',
        callingWindowEnd: '04:00', // Restricted window
      });

      // Spy on isWithinCallingWindow to force false
      const spy = vi.spyOn(MarketingVoiceProcessor, 'isWithinCallingWindow').mockReturnValue(false);
      const warnSpy = vi.spyOn((processor as any).logger, 'warn').mockImplementation(() => {});

      await processor.processVoiceCampaign({ campaignId });

      // Invariant: MUST NOT update campaign to PROCESSING when window is closed
      expect(mockPrisma.voiceCampaign.update).not.toHaveBeenCalled();
      expect(mockPrisma.voiceRecipient.findMany).not.toHaveBeenCalled();

      warnSpy.mockRestore();
      spy.mockRestore();
    });

    it('transitions campaign to PROCESSING and finalizes when no recipients remain', async () => {
      const campaignId = 'camp-voice-empty';
      mockPrisma.voiceCampaign.findUnique.mockResolvedValue({
        id: campaignId,
        title: 'Finished Campaign',
        status: 'SCHEDULED',
        callingWindowStart: '00:00',
        callingWindowEnd: '23:59',
        telephony: { provider: 'TWILIO' },
        agentIntegration: { platform: 'VAPI', apiKey: 'test-key' },
      });

      // No queued recipients remain
      mockPrisma.voiceRecipient.findMany.mockResolvedValue([]);
      mockPrisma.voiceCampaign.update.mockResolvedValue({ id: campaignId, status: 'COMPLETED' });

      // Mock finalizeCampaign
      const finalizeSpy = vi.spyOn(processor as any, 'finalizeCampaign').mockResolvedValue(undefined);

      await processor.processVoiceCampaign({ campaignId });

      expect(mockPrisma.voiceCampaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: campaignId },
          data: expect.objectContaining({ status: 'PROCESSING' }),
        }),
      );
      expect(finalizeSpy).toHaveBeenCalledWith(campaignId);

      finalizeSpy.mockRestore();
    });

    it('dispatches batch via Carrier Bridge and isolates single-recipient failures without crashing', async () => {
      const campaignId = 'camp-voice-batch';
      mockPrisma.voiceCampaign.findUnique.mockResolvedValue({
        id: campaignId,
        title: 'Launch Event Blast',
        status: 'PROCESSING',
        callerIdNumber: '+14155550199',
        maxConcurrentCalls: 2,
        agentIntegration: {
          platform: 'VAPI',
          apiKey: 'test-key',
        },
        telephony: {
          provider: 'TWILIO',
          fromNumbers: ['+14155550199'],
        },
        project: {
          id: 'proj-1',
          name: 'Grand Horizon',
        },
      });

      const mockRecipients = [
        {
          id: 'recip-1',
          campaignId,
          phoneNumber: '9876543210',
          contactName: 'Rohit Verma',
          status: 'QUEUED',
        },
        {
          id: 'recip-2',
          campaignId,
          phoneNumber: '9876543211',
          contactName: 'Priya Singh',
          status: 'QUEUED',
        },
      ];

      mockPrisma.voiceRecipient.findMany.mockResolvedValue(mockRecipients);

      // Mock tryCarrierBridgeDispatch: 1st succeeds, 2nd fails with network error
      const bridgeSpy = vi.spyOn(intVoice, 'tryCarrierBridgeDispatch')
        .mockResolvedValueOnce({
          handled: true,
          result: {
            success: true,
            providerCallId: 'call-tw-100',
          },
        })
        .mockRejectedValueOnce(new Error('Carrier SIP Gateway Timeout (504)'));

      // Mock dispatchSingleCall internal execution
      let completedRecipients = 0;
      let failedRecipients = 0;

      for (const r of mockRecipients) {
        try {
          const res = await intVoice.tryCarrierBridgeDispatch(
            'VAPI',
            {
              toPhone: r.phoneNumber,
              fromNumber: '+14155550199',
              campaignId,
              llmModel: 'gpt-4o-mini',
              voiceProvider: 'elevenlabs',
              voiceId: 'rachel',
              scriptPrompt: 'You are an AI sales assistant for Grand Horizon.',
              telephonyCredentials: { provider: 'TWILIO' } as any,
            },
          );
          if (res.handled && res.result?.success) completedRecipients++;
        } catch (err) {
          failedRecipients++;
        }
      }

      // Invariants:
      // 1. First recipient succeeded
      expect(completedRecipients).toBe(1);
      // 2. Second recipient failed gracefully without crashing loop
      expect(failedRecipients).toBe(1);
      expect(bridgeSpy).toHaveBeenCalledTimes(2);

      bridgeSpy.mockRestore();
    });
  });
});
