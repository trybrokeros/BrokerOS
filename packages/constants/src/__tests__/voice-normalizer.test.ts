import { describe, it, expect } from 'vitest';
import { normalizeVoiceLeadVariables, interpolateVoiceTemplate } from '../voice/normalizer.js';
import { USD_TO_INR_EXCHANGE_RATE, DEFAULT_MERGE_TAGS } from '../campaign.js';
import { VOICE_TELEPHONY_PRICING_ESTIMATES, VOICE_AGENT_PRICING_ESTIMATES } from '../voice/pricing.js';

describe('@brokeros/constants — Voice Normalizer & Pricing Invariants', () => {
  describe('normalizeVoiceLeadVariables & interpolateVoiceTemplate', () => {
    it('normalizes a lead with standard fields correctly', () => {
      const lead = {
        name: 'Rahul Sharma',
        phone: '+919800000000',
        city: 'Mumbai',
        budget: 15000000,
        temperature: 'HOT',
      };
      const project = {
        name: 'Skyline Luxuria',
        city: 'Mumbai',
        location: 'Bandra West',
        startingPrice: '₹1.5 Cr',
      };

      const vars = normalizeVoiceLeadVariables(lead, project, 'Aakash');

      expect(vars.fullName).toBe('Rahul Sharma');
      expect(vars.firstName).toBe('Rahul');
      expect(vars.projectName).toBe('Skyline Luxuria');
      expect(vars.agentName).toBe('Aakash');
      expect(vars.city).toBe('Mumbai');
      expect(vars.budget).toBe('₹1.50 Cr');
    });

    it('falls back gracefully when lead is null or empty', () => {
      const vars = normalizeVoiceLeadVariables(null, null);

      expect(vars.firstName).toBe('Valued Client');
      expect(vars.fullName).toBe('Valued Client');
      expect(vars.projectName).toBe('our premier luxury development');
      expect(vars.agentName).toBe('Senior Property Advisor');
    });

    it('resolves first name from full name if first name is not provided', () => {
      const lead = {
        fullName: 'Priya Patel',
      };
      const vars = normalizeVoiceLeadVariables(lead, null);
      expect(vars.firstName).toBe('Priya');
      expect(vars.fullName).toBe('Priya Patel');
    });

    it('interpolates merge tags from customFields or mergeData dictionary', () => {
      const lead = {
        mergeData: {
          'Full Name': 'Amit Verma',
          'Preferred Floor': '18th Floor',
        },
      };
      const vars = normalizeVoiceLeadVariables(lead, null);
      expect(vars.fullName).toBe('Amit Verma');
      expect(vars.firstName).toBe('Amit');
      expect(vars['Preferred Floor']).toBe('18th Floor');
    });

    it('pre-interpolates templates with resolved lead and project variables', () => {
      const vars = normalizeVoiceLeadVariables(
        { name: 'Rohan Gupta' },
        { name: 'Emerald Heights', location: 'Worli' },
        'Sonia',
      );

      const template = 'Hello {{lead.firstName}}, this is {{agent.name}} regarding {{project.name}} in {{project.location}}.';
      const rendered = interpolateVoiceTemplate(template, vars);

      expect(rendered).toBe('Hello Rohan, this is Sonia regarding Emerald Heights in Worli.');
    });
  });

  describe('Pricing & Currency Invariants', () => {
    it('enforces USD to INR exchange rate constant is set to 95', () => {
      expect(USD_TO_INR_EXCHANGE_RATE).toBe(95);
    });

    it('calculates telephony per-minute INR prices accurately from USD rate', () => {
      const twilio = VOICE_TELEPHONY_PRICING_ESTIMATES.TWILIO;
      expect(twilio.costPerMinuteINR).toBe(Number((0.014 * 95).toFixed(2)));

      const vobiz = VOICE_TELEPHONY_PRICING_ESTIMATES.VOBIZ;
      expect(vobiz.costPerMinuteINR).toBe(Number((0.008 * 95).toFixed(2)));
    });

    it('calculates AI voice agent per-minute INR pricing accurately', () => {
      const sarvam = VOICE_AGENT_PRICING_ESTIMATES.SARVAM;
      expect(sarvam.costPerMinuteINR).toBe(Number((0.02 * 95).toFixed(2)));

      const vapi = VOICE_AGENT_PRICING_ESTIMATES.VAPI;
      expect(vapi.costPerMinuteINR).toBe(Number((0.05 * 95).toFixed(2)));
    });

    it('contains all required default merge tags', () => {
      const tags = DEFAULT_MERGE_TAGS.map((t) => t.tag);
      expect(tags).toContain('{{lead.firstName}}');
      expect(tags).toContain('{{lead.fullName}}');
      expect(tags).toContain('{{project.name}}');
      expect(tags).toContain('{{agent.name}}');
    });
  });
});
